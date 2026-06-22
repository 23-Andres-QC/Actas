import { Pool } from 'pg';
import { Area } from '../domain/area.entity';
import { AreaRepository } from '../domain/area.repository';

interface AreaRow { id: string; nombre: string }

export class PostgresAreaRepository implements AreaRepository {
  constructor(private readonly pool: Pool) {}

  public async findAll(): Promise<Area[]> {
    const result = await this.pool.query<AreaRow>('select id, nombre from area order by nombre');
    return result.rows.map((row) => Area.create(row.nombre, row.id));
  }

  public async findByName(nombre: string): Promise<Area | null> {
    const result = await this.pool.query<AreaRow>('select id, nombre from area where lower(nombre) = lower($1)', [nombre]);
    const row = result.rows[0];
    return row ? Area.create(row.nombre, row.id) : null;
  }

  public async save(area: Area): Promise<void> {
    await this.pool.query('insert into area (id, nombre) values ($1, $2)', [area.id, area.nombre]);
  }
}
