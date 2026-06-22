import { Pool } from 'pg';
import { ActaDocumentoInfo, ActaDocumentoRepository } from '../domain/acta-documento.repository';

interface ActaDocumentoRow {
  acta_id: string;
  path: string;
  version: string;
  updated_at: Date;
}

export class PostgresActaDocumentoRepository implements ActaDocumentoRepository {
  constructor(private readonly pool: Pool) {}

  public async findByActaId(actaId: string): Promise<ActaDocumentoInfo | null> {
    const result = await this.pool.query<ActaDocumentoRow>(
      'select * from acta_documento where acta_id = $1',
      [actaId],
    );
    const row = result.rows[0];
    return row ? { actaId: row.acta_id, path: row.path, version: row.version, updatedAt: row.updated_at } : null;
  }

  public async guardar(info: ActaDocumentoInfo): Promise<void> {
    await this.pool.query(
      `insert into acta_documento (acta_id, path, version, updated_at)
       values ($1, $2, $3, $4)
       on conflict (acta_id) do update set path = $2, version = $3, updated_at = $4`,
      [info.actaId, info.path, info.version, info.updatedAt],
    );
  }
}
