import { Pool } from 'pg';
import { UsuarioRepository, UsuarioListadoInfo } from '../domain/usuario.repository';
import { Usuario } from '../domain/usuario.entity';
import { Rol } from '../domain/value-objects/rol.vo';

interface UsuarioRow {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: string;
  area_id: string | null;
  es_jefe: boolean;
  cargo: string | null;
}

interface UsuarioListadoRow extends UsuarioRow {
  area_nombre: string | null;
}

function toDomain(row: UsuarioRow): Usuario {
  return Usuario.create(
    {
      nombre: row.nombre,
      email: row.email,
      passwordHash: row.password_hash,
      rol: Rol.create(row.rol),
      areaId: row.area_id,
      esJefe: row.es_jefe,
      cargo: row.cargo,
    },
    row.id,
  );
}

function toListadoInfo(row: UsuarioListadoRow): UsuarioListadoInfo {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    rol: row.rol,
    areaId: row.area_id,
    areaNombre: row.area_nombre,
    esJefe: row.es_jefe,
    cargo: row.cargo,
  };
}

const LISTADO_SQL = `
  select u.*, a.nombre as area_nombre
  from usuario u
  left join area a on a.id = u.area_id
`;

export class PostgresUsuarioRepository implements UsuarioRepository {
  constructor(private readonly pool: Pool) {}

  public async findById(id: string): Promise<Usuario | null> {
    const result = await this.pool.query<UsuarioRow>('select * from usuario where id = $1', [id]);
    const row = result.rows[0];
    return row ? toDomain(row) : null;
  }

  public async findByEmail(email: string): Promise<Usuario | null> {
    const result = await this.pool.query<UsuarioRow>('select * from usuario where lower(email) = lower($1)', [email]);
    const row = result.rows[0];
    return row ? toDomain(row) : null;
  }

  public async findAll(filtro?: { areaId?: string }): Promise<Usuario[]> {
    if (filtro?.areaId) {
      const result = await this.pool.query<UsuarioRow>(
        'select * from usuario where area_id = $1 order by nombre',
        [filtro.areaId],
      );
      return result.rows.map(toDomain);
    }
    const result = await this.pool.query<UsuarioRow>('select * from usuario order by nombre');
    return result.rows.map(toDomain);
  }

  public async findAllListado(filtro?: { areaId?: string }): Promise<UsuarioListadoInfo[]> {
    if (filtro?.areaId) {
      const result = await this.pool.query<UsuarioListadoRow>(
        `${LISTADO_SQL} where u.area_id = $1 order by u.nombre`,
        [filtro.areaId],
      );
      return result.rows.map(toListadoInfo);
    }
    const result = await this.pool.query<UsuarioListadoRow>(`${LISTADO_SQL} order by u.nombre`);
    return result.rows.map(toListadoInfo);
  }

  public async findJefeByAreaId(areaId: string): Promise<Usuario | null> {
    const result = await this.pool.query<UsuarioRow>(
      'select * from usuario where area_id = $1 and es_jefe = true limit 1',
      [areaId],
    );
    const row = result.rows[0];
    return row ? toDomain(row) : null;
  }

  public async save(usuario: Usuario): Promise<void> {
    await this.pool.query(
      `insert into usuario (id, nombre, email, password_hash, rol, area_id, es_jefe, cargo)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (id) do update
         set nombre = $2, email = $3, password_hash = $4, rol = $5,
             area_id = $6, es_jefe = $7, cargo = $8`,
      [usuario.id, usuario.nombre, usuario.email, usuario.passwordHash,
       usuario.rol.value, usuario.areaId, usuario.esJefe, usuario.cargo],
    );
  }
}
