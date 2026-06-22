import { Pool } from 'pg';
import { UsuarioRepository } from '../domain/usuario.repository';
import { Usuario } from '../domain/usuario.entity';
import { Rol } from '../domain/value-objects/rol.vo';

interface UsuarioRow {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: string;
  area_id: string | null;
  cargo: string | null;
}

function toDomain(row: UsuarioRow): Usuario {
  return Usuario.create(
    {
      nombre: row.nombre,
      email: row.email,
      passwordHash: row.password_hash,
      rol: Rol.create(row.rol),
      areaId: row.area_id,
      cargo: row.cargo,
    },
    row.id,
  );
}

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

  public async save(usuario: Usuario): Promise<void> {
    await this.pool.query(
      `insert into usuario (id, nombre, email, password_hash, rol, area_id, cargo)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (id) do update set nombre = $2, email = $3, password_hash = $4, rol = $5, area_id = $6, cargo = $7`,
      [usuario.id, usuario.nombre, usuario.email, usuario.passwordHash, usuario.rol.value, usuario.areaId, usuario.cargo],
    );
  }
}
