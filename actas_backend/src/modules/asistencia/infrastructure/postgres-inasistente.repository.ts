import { Pool } from 'pg';
import { InasistenteRepository } from '../domain/inasistente.entity';

export class PostgresInasistenteRepository implements InasistenteRepository {
  constructor(private readonly pool: Pool) {}

  public async guardarEvidencia(actaId: string, usuarioId: string, evidenciaUrl: string): Promise<void> {
    await this.pool.query(
      `insert into inasistente (acta_id, usuario_id, evidencia_url)
       values ($1, $2, $3)
       on conflict (acta_id, usuario_id) do update set evidencia_url = $3`,
      [actaId, usuarioId, evidenciaUrl],
    );
  }
}
