import { Accion } from './accion.entity';

export interface AccionRepository {
  findById(id: string): Promise<Accion | null>;
  findByAcuerdoId(acuerdoId: string): Promise<Accion[]>;
  save(accion: Accion): Promise<void>;
}
