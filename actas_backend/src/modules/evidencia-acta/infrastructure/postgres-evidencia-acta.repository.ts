import { Pool } from 'pg';
import { EvidenciaActaRepository } from '../domain/evidencia-acta.repository';
import { EvidenciaActa, TipoEvidencia } from '../domain/evidencia-acta.entity';

interface EvidenciaActaRow {
  id: string;
  acta_id: string;
  url_archivo: string;
  tipo: TipoEvidencia;
  fecha_subida: Date;
}

export class PostgresEvidenciaActaRepository implements EvidenciaActaRepository {
  constructor(private readonly pool: Pool) {}

  public async findByActaId(actaId: string): Promise<EvidenciaActa[]> {
    const result = await this.pool.query<EvidenciaActaRow>(
      'select * from evidencia_acta where acta_id = $1 order by fecha_subida desc',
      [actaId],
    );
    return result.rows.map((row) =>
      EvidenciaActa.reconstruir(
        { actaId: row.acta_id, urlArchivo: row.url_archivo, tipo: row.tipo, fechaSubida: row.fecha_subida },
        row.id,
      ),
    );
  }

  public async save(evidencia: EvidenciaActa): Promise<void> {
    await this.pool.query(
      'insert into evidencia_acta (id, acta_id, url_archivo, tipo, fecha_subida) values ($1, $2, $3, $4, $5)',
      [evidencia.id, evidencia.actaId, evidencia.urlArchivo, evidencia.tipo, evidencia.fechaSubida],
    );
  }
}
