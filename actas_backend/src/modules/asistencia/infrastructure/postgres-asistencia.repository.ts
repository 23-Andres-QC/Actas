import { Pool } from 'pg';
import { AsistenciaRepository } from '../domain/asistencia.repository';
import { Asistencia, MetodoAsistencia } from '../domain/asistencia.entity';

interface AsistenciaRow {
  id: string;
  acta_id: string;
  usuario_id: string;
  metodo: MetodoAsistencia;
  fecha_hora: Date;
  firma_url: string | null;
}

function toDomain(row: AsistenciaRow): Asistencia {
  return Asistencia.reconstruir(
    {
      actaId: row.acta_id,
      usuarioId: row.usuario_id,
      metodo: row.metodo,
      fechaHora: row.fecha_hora,
      firmaUrl: row.firma_url,
    },
    row.id,
  );
}

export class PostgresAsistenciaRepository implements AsistenciaRepository {
  constructor(private readonly pool: Pool) {}

  public async findByActaId(actaId: string): Promise<Asistencia[]> {
    const result = await this.pool.query<AsistenciaRow>(
      'select * from asistencia where acta_id = $1 order by fecha_hora',
      [actaId],
    );
    return result.rows.map(toDomain);
  }

  public async save(asistencia: Asistencia): Promise<void> {
    // Conflicto por (acta_id, usuario_id), no por id: cada llamada genera un id nuevo,
    // así que re-escanear el QR para la misma reunión debe actualizar el registro
    // existente en vez de crear uno duplicado.
    await this.pool.query(
      `insert into asistencia (id, acta_id, usuario_id, metodo, fecha_hora, firma_url)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (acta_id, usuario_id) do update set
         metodo = excluded.metodo,
         fecha_hora = excluded.fecha_hora,
         firma_url = coalesce(excluded.firma_url, asistencia.firma_url)`,
      [
        asistencia.id,
        asistencia.actaId,
        asistencia.usuarioId,
        asistencia.metodo,
        asistencia.fechaHora,
        asistencia.firmaUrl,
      ],
    );
  }
}
