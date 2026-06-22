import { Pool } from 'pg';
import { AccionRepository } from '../domain/accion.repository';
import { Accion } from '../domain/accion.entity';

interface AccionRow {
  id: string;
  acuerdo_id: string;
  descripcion: string;
  fecha_fin: Date;
  completada: boolean;
}

function toDomain(row: AccionRow): Accion {
  return Accion.reconstruir(
    {
      acuerdoId: row.acuerdo_id,
      descripcion: row.descripcion,
      fechaFin: row.fecha_fin,
      completada: row.completada,
    },
    row.id,
  );
}

export class PostgresAccionRepository implements AccionRepository {
  constructor(private readonly pool: Pool) {}

  public async findById(id: string): Promise<Accion | null> {
    const result = await this.pool.query<AccionRow>('select * from accion where id = $1', [id]);
    const row = result.rows[0];
    return row ? toDomain(row) : null;
  }

  public async findByAcuerdoId(acuerdoId: string): Promise<Accion[]> {
    const result = await this.pool.query<AccionRow>(
      'select * from accion where acuerdo_id = $1 order by sort_order asc, created_at asc',
      [acuerdoId],
    );
    return result.rows.map(toDomain);
  }

  public async save(accion: Accion): Promise<void> {
    await this.pool.query(
      `insert into accion (id, acuerdo_id, descripcion, fecha_fin, completada)
       values ($1, $2, $3, $4, $5)
       on conflict (id) do update set
         descripcion = $3, fecha_fin = $4, completada = $5`,
      [accion.id, accion.acuerdoId, accion.descripcion, accion.fechaFin, accion.completada],
    );
  }

  public async reordenar(items: { id: string; orden: number }[]): Promise<void> {
    if (!items.length) return;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const { id, orden } of items) {
        await client.query('UPDATE accion SET sort_order = $1 WHERE id = $2', [orden, id]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
