import { Pool } from 'pg';
import { InasistentesProvider, InasistenteInfo } from '../domain/inasistente.entity';

interface InasistenteRow {
  usuario_id: string;
  nombre: string;
  email: string;
  evidencia_url: string | null;
}

/**
 * Calcula inasistentes como: invitados explícitos de la acta (tabla `acta_invitado`,
 * fijada al crear la acta) que NO tienen un registro en `asistencia` para esa acta.
 */
export class PostgresInasistentesProvider implements InasistentesProvider {
  constructor(private readonly pool: Pool) {}

  public async obtenerPorActa(actaId: string): Promise<InasistenteInfo[]> {
    const result = await this.pool.query<InasistenteRow>(
      `select u.id as usuario_id, u.nombre, u.email, i.evidencia_url
       from acta_invitado ai
       join usuario u on u.id = ai.usuario_id
       left join asistencia asis on asis.acta_id = ai.acta_id and asis.usuario_id = u.id
       left join inasistente i on i.acta_id = ai.acta_id and i.usuario_id = u.id
       where ai.acta_id = $1 and asis.id is null
       order by u.nombre`,
      [actaId],
    );

    return result.rows.map((row) => ({
      usuarioId: row.usuario_id,
      nombre: row.nombre,
      email: row.email,
      evidenciaUrl: row.evidencia_url,
    }));
  }
}
