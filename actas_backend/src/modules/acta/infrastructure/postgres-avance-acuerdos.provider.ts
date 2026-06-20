import { Pool } from 'pg';
import { AvanceAcuerdosProvider } from '../domain/avance-acuerdos.provider';

export class PostgresAvanceAcuerdosProvider implements AvanceAcuerdosProvider {
  constructor(private readonly pool: Pool) {}

  public async obtenerPorcentajesPorActa(actaId: string): Promise<number[]> {
    const result = await this.pool.query<{ porcentaje_avance: string }>(
      'select porcentaje_avance from acuerdo where acta_id = $1',
      [actaId],
    );
    return result.rows.map((row) => Number(row.porcentaje_avance));
  }
}
