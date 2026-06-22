import { Pool } from 'pg';
import { FirmaUsuarioRepository } from '../domain/firma-usuario.repository';

export class PostgresFirmaUsuarioRepository implements FirmaUsuarioRepository {
  constructor(private readonly pool: Pool) {}

  public async obtenerPorUsuario(usuarioId: string): Promise<string | null> {
    const result = await this.pool.query<{ firma_url: string }>(
      'select firma_url from firma_usuario where usuario_id = $1',
      [usuarioId],
    );
    return result.rows[0]?.firma_url ?? null;
  }

  public async guardar(usuarioId: string, firmaUrl: string): Promise<void> {
    await this.pool.query(
      `insert into firma_usuario (usuario_id, firma_url, actualizado_en)
       values ($1, $2, now())
       on conflict (usuario_id) do update set firma_url = $2, actualizado_en = now()`,
      [usuarioId, firmaUrl],
    );
  }
}
