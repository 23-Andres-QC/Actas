import { Pool } from 'pg';
import { EvidenciaRepository } from '../domain/evidencia.repository';
import { Evidencia } from '../domain/evidencia.entity';

interface EvidenciaRow {
  id: string;
  acuerdo_id: string;
  url_archivo: string;
}

export class PostgresEvidenciaRepository implements EvidenciaRepository {
  constructor(private readonly pool: Pool) {}

  public async findByAcuerdoId(acuerdoId: string): Promise<Evidencia[]> {
    const result = await this.pool.query<EvidenciaRow>(
      'select * from evidencia_acuerdo where acuerdo_id = $1 order by fecha_subida desc',
      [acuerdoId],
    );
    return result.rows.map((row) =>
      Evidencia.subir({ acuerdoId: row.acuerdo_id, urlArchivo: row.url_archivo }, row.id),
    );
  }

  public async save(evidencia: Evidencia): Promise<void> {
    await this.pool.query(
      'insert into evidencia_acuerdo (id, acuerdo_id, url_archivo, fecha_subida) values ($1, $2, $3, $4)',
      [evidencia.id, evidencia.acuerdoId, evidencia.urlArchivo, evidencia.fechaSubida],
    );
  }
}
