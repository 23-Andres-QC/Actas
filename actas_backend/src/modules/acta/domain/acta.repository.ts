import { Acta } from './acta.entity';

export interface ActaRepository {
  findById(id: string): Promise<Acta | null>;
  findAll(filtro?: { areaId?: string }): Promise<Acta[]>;
  save(acta: Acta): Promise<void>;
}
