import { Pool } from 'pg';
import { ActaRepository } from '../domain/acta.repository';
import { Acta, FormatoActa, Proceso, TipoReunion } from '../domain/acta.entity';
import { PorcentajeAvance } from '../domain/value-objects/porcentaje-avance.vo';

interface ActaRow {
  id: string;
  area_id: string;
  convocador_id: string;
  titulo: string;
  fecha: Date;
  formato: FormatoActa;
  tipo_reunion: TipoReunion;
  proceso: Proceso;
  lugar: string;
  hora_inicio: string;
  hora_fin: string;
  objetivo: string;
  agenda: string;
  url_grabacion: string | null;
  url_acta_fisica: string | null;
  url_reunion: string | null;
  qr_token: string;
  porcentaje_avance: string;
}

function toDomain(row: ActaRow): Acta {
  return Acta.reconstruir(
    {
      areaId: row.area_id,
      convocadorId: row.convocador_id,
      titulo: row.titulo,
      fecha: row.fecha,
      formato: row.formato,
      tipoReunion: row.tipo_reunion,
      proceso: row.proceso,
      lugar: row.lugar,
      horaInicio: row.hora_inicio,
      horaFin: row.hora_fin,
      objetivo: row.objetivo,
      agenda: row.agenda,
      urlGrabacion: row.url_grabacion,
      urlActaFisica: row.url_acta_fisica,
      urlReunion: row.url_reunion,
      qrToken: row.qr_token,
      porcentajeAvance: PorcentajeAvance.create(Number(row.porcentaje_avance)),
    },
    row.id,
  );
}

export class PostgresActaRepository implements ActaRepository {
  constructor(private readonly pool: Pool) {}

  public async findById(id: string): Promise<Acta | null> {
    const result = await this.pool.query<ActaRow>('select * from acta where id = $1', [id]);
    const row = result.rows[0];
    return row ? toDomain(row) : null;
  }

  public async findAll(filtro?: { areaId?: string }): Promise<Acta[]> {
    if (filtro?.areaId) {
      const result = await this.pool.query<ActaRow>(
        'select * from acta where area_id = $1 order by fecha desc',
        [filtro.areaId],
      );
      return result.rows.map(toDomain);
    }
    const result = await this.pool.query<ActaRow>('select * from acta order by fecha desc');
    return result.rows.map(toDomain);
  }

  public async save(acta: Acta): Promise<void> {
    await this.pool.query(
      `insert into acta (
         id, area_id, convocador_id, titulo, fecha, formato,
         tipo_reunion, proceso, lugar, hora_inicio, hora_fin, objetivo, agenda,
         url_grabacion, url_acta_fisica, url_reunion, qr_token, porcentaje_avance
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       on conflict (id) do update set
         titulo = $4, fecha = $5, formato = $6,
         tipo_reunion = $7, proceso = $8, lugar = $9, hora_inicio = $10, hora_fin = $11,
         objetivo = $12, agenda = $13,
         url_grabacion = $14, url_acta_fisica = $15, url_reunion = $16, qr_token = $17, porcentaje_avance = $18`,
      [
        acta.id,
        acta.areaId,
        acta.convocadorId,
        acta.titulo,
        acta.fecha,
        acta.formato,
        acta.tipoReunion,
        acta.proceso,
        acta.lugar,
        acta.horaInicio,
        acta.horaFin,
        acta.objetivo,
        acta.agenda,
        acta.urlGrabacion,
        acta.urlActaFisica,
        acta.urlReunion,
        acta.qrToken,
        acta.porcentajeAvance.value,
      ],
    );
  }

  public async guardarInvitados(actaId: string, usuarioIds: string[]): Promise<void> {
    await this.pool.query('delete from acta_invitado where acta_id = $1', [actaId]);
    if (usuarioIds.length === 0) return;
    const values = usuarioIds.map((_, i) => `($1, $${i + 2})`).join(', ');
    await this.pool.query(`insert into acta_invitado (acta_id, usuario_id) values ${values}`, [actaId, ...usuarioIds]);
  }
}
