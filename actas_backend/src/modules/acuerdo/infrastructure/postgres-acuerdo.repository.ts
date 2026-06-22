import { Pool } from 'pg';
import { AcuerdoRepository } from '../domain/acuerdo.repository';
import { Acuerdo } from '../domain/acuerdo.entity';
import { Semaforo, SemaforoValue } from '../../acta/domain/value-objects/semaforo.vo';
import { PorcentajeAvance } from '../../acta/domain/value-objects/porcentaje-avance.vo';

interface AcuerdoRow {
  id: string;
  acta_id: string;
  responsable_id: string;
  descripcion: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  estado_semaforo: SemaforoValue;
  porcentaje_avance: string;
}

function toDomain(row: AcuerdoRow): Acuerdo {
  return Acuerdo.reconstruir(
    {
      actaId: row.acta_id,
      responsableId: row.responsable_id,
      descripcion: row.descripcion,
      fechaInicio: row.fecha_inicio,
      fechaFin: row.fecha_fin,
      estadoSemaforo: Semaforo.create(row.estado_semaforo),
      porcentajeAvance: PorcentajeAvance.create(Number(row.porcentaje_avance)),
    },
    row.id,
  );
}

export class PostgresAcuerdoRepository implements AcuerdoRepository {
  constructor(private readonly pool: Pool) {}

  public async findById(id: string): Promise<Acuerdo | null> {
    const result = await this.pool.query<AcuerdoRow>('select * from acuerdo where id = $1', [id]);
    const row = result.rows[0];
    return row ? toDomain(row) : null;
  }

  public async findByActaId(actaId: string): Promise<Acuerdo[]> {
    const result = await this.pool.query<AcuerdoRow>(
      'select * from acuerdo where acta_id = $1 order by sort_order asc, created_at asc',
      [actaId],
    );
    return result.rows.map(toDomain);
  }

  public async findByResponsableId(responsableId: string): Promise<Acuerdo[]> {
    const result = await this.pool.query<AcuerdoRow>(
      'select * from acuerdo where responsable_id = $1 order by fecha_fin',
      [responsableId],
    );
    return result.rows.map(toDomain);
  }

  public async findTieneEvidenciasByActaId(actaId: string): Promise<Map<string, boolean>> {
    const result = await this.pool.query<{ acuerdo_id: string }>(
      `select distinct ac.acuerdo_id
       from accion ac
       join evidencia_accion ea on ea.accion_id = ac.id
       where ac.acuerdo_id in (select id from acuerdo where acta_id = $1)`,
      [actaId],
    );
    const conEvidencias = new Set(result.rows.map((r) => r.acuerdo_id));
    const acuerdos = await this.findByActaId(actaId);
    return new Map(acuerdos.map((a) => [a.id, conEvidencias.has(a.id)]));
  }

  public async reordenar(items: { id: string; orden: number }[]): Promise<void> {
    if (!items.length) return;
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const { id, orden } of items) {
        await client.query('UPDATE acuerdo SET sort_order = $1 WHERE id = $2', [orden, id]);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async save(acuerdo: Acuerdo): Promise<void> {
    await this.pool.query(
      `insert into acuerdo (id, acta_id, responsable_id, descripcion, fecha_inicio, fecha_fin, estado_semaforo, porcentaje_avance)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (id) do update set
         descripcion = $4, fecha_inicio = $5, fecha_fin = $6, estado_semaforo = $7, porcentaje_avance = $8`,
      [
        acuerdo.id,
        acuerdo.actaId,
        acuerdo.responsableId,
        acuerdo.descripcion,
        acuerdo.fechaInicio,
        acuerdo.fechaFin,
        acuerdo.estadoSemaforo.value,
        acuerdo.porcentajeAvance.value,
      ],
    );
  }
}
