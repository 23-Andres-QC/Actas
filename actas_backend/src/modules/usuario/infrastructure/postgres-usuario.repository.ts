import { Pool } from 'pg';
import { UsuarioRepository } from '../domain/usuario.repository';
import { Usuario } from '../domain/usuario.entity';
import { Rol } from '../domain/value-objects/rol.vo';

interface UsuarioRow {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  area_id: string | null;
  cargo: string | null;
}

function toDomain(row: UsuarioRow): Usuario {
  return Usuario.create(
    {
      nombre: row.nombre,
      email: row.email,
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
      `insert into usuario (id, nombre, email, rol, area_id, cargo)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (id) do update set nombre = $2, email = $3, rol = $4, area_id = $5, cargo = $6`,
      [usuario.id, usuario.nombre, usuario.email, usuario.rol.value, usuario.areaId, usuario.cargo],
    );
  }
}
