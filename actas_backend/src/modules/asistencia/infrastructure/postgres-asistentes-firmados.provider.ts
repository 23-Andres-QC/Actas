import { Pool } from 'pg';
import { AsistentesFirmadosProvider, AsistenteFirmadoInfo } from '../domain/asistente-firmado.entity';
import { MetodoAsistencia } from '../domain/asistencia.entity';

interface AsistenteFirmadoRow {
  usuario_id: string;
  nombre: string;
  email: string;
  cargo: string | null;
  metodo: MetodoAsistencia;
  fecha_hora: Date;
  firma_url: string | null;
}

export class PostgresAsistentesFirmadosProvider implements AsistentesFirmadosProvider {
  constructor(private readonly pool: Pool) {}

  public async obtenerPorActa(actaId: string): Promise<AsistenteFirmadoInfo[]> {
    const result = await this.pool.query<AsistenteFirmadoRow>(
      `select u.id as usuario_id, u.nombre, u.email, u.cargo, asis.metodo, asis.fecha_hora, asis.firma_url
       from asistencia asis
       join usuario u on u.id = asis.usuario_id
       where asis.acta_id = $1
       order by asis.fecha_hora`,
      [actaId],
    );

    return result.rows.map((row) => ({
      usuarioId: row.usuario_id,
      nombre: row.nombre,
      email: row.email,
      cargo: row.cargo,
      metodo: row.metodo,
      fechaHora: row.fecha_hora.toISOString(),
      firmaUrl: row.firma_url,
    }));
  }
}
