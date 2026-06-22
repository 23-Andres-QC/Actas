import { Pool } from 'pg';

export class PostgresRostroRepository {
  constructor(private readonly pool: Pool) {}

  public async obtenerEmbedding(usuarioId: string): Promise<number[] | null> {
    const result = await this.pool.query<{ embedding: number[] }>(
      'select embedding from rostro_usuario where usuario_id = $1',
      [usuarioId],
    );
    return result.rows[0]?.embedding ?? null;
  }

  public async guardarEmbedding(usuarioId: string, embedding: number[]): Promise<void> {
    await this.pool.query(
      `insert into rostro_usuario (usuario_id, embedding, actualizado_en)
       values ($1, $2, now())
       on conflict (usuario_id) do update set embedding = $2, actualizado_en = now()`,
      [usuarioId, embedding],
    );
  }
}
