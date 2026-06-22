import { Pool } from 'pg';
import { EvidenciaRepository } from '../domain/evidencia.repository';
import { Evidencia, TipoEvidencia } from '../domain/evidencia.entity';

interface EvidenciaRow {
  id: string;
  acuerdo_id: string;
  url_archivo: string;
  tipo: TipoEvidencia;
  fecha_subida: Date;
}

export class PostgresEvidenciaRepository implements EvidenciaRepository {
  constructor(private readonly pool: Pool) {}

  public async findByAcuerdoId(acuerdoId: string): Promise<Evidencia[]> {
    const result = await this.pool.query<EvidenciaRow>(
      'select * from evidencia_acuerdo where acuerdo_id = $1 order by fecha_subida desc',
      [acuerdoId],
    );
    return result.rows.map((row) =>
      Evidencia.reconstruir(
        { acuerdoId: row.acuerdo_id, urlArchivo: row.url_archivo, tipo: row.tipo, fechaSubida: row.fecha_subida },
        row.id,
      ),
    );
  }

  public async save(evidencia: Evidencia): Promise<void> {
    await this.pool.query(
      'insert into evidencia_acuerdo (id, acuerdo_id, url_archivo, tipo, fecha_subida) values ($1, $2, $3, $4, $5)',
      [evidencia.id, evidencia.acuerdoId, evidencia.urlArchivo, evidencia.tipo, evidencia.fechaSubida],
    );
  }
}
