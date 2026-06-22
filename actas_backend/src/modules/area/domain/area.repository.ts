import { Area } from './area.entity';

export interface AreaRepository {
  findAll(): Promise<Area[]>;
  findByName(nombre: string): Promise<Area | null>;
  save(area: Area): Promise<void>;
}
