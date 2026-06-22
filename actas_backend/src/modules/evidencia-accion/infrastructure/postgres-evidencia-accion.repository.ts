import { Pool } from 'pg';
import { EvidenciaAccionRepository } from '../domain/evidencia-accion.repository';
import { EvidenciaAccion, TipoEvidencia } from '../domain/evidencia-accion.entity';

interface EvidenciaAccionRow {
  id: string;
  accion_id: string;
  url_archivo: string;
  tipo: TipoEvidencia;
  fecha_subida: Date;
}

export class PostgresEvidenciaAccionRepository implements EvidenciaAccionRepository {
  constructor(private readonly pool: Pool) {}

  public async findByAccionId(accionId: string): Promise<EvidenciaAccion[]> {
    const result = await this.pool.query<EvidenciaAccionRow>(
      'select * from evidencia_accion where accion_id = $1 order by fecha_subida desc',
      [accionId],
    );
    return result.rows.map((row) =>
      EvidenciaAccion.reconstruir(
        { accionId: row.accion_id, urlArchivo: row.url_archivo, tipo: row.tipo, fechaSubida: row.fecha_subida },
        row.id,
      ),
    );
  }

  public async save(evidencia: EvidenciaAccion): Promise<void> {
    await this.pool.query(
      'insert into evidencia_accion (id, accion_id, url_archivo, tipo, fecha_subida) values ($1, $2, $3, $4, $5)',
      [evidencia.id, evidencia.accionId, evidencia.urlArchivo, evidencia.tipo, evidencia.fechaSubida],
    );
  }
}
