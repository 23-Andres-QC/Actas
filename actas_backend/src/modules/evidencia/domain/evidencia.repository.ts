import { Evidencia } from './evidencia.entity';

export interface EvidenciaRepository {
  findByAcuerdoId(acuerdoId: string): Promise<Evidencia[]>;
  save(evidencia: Evidencia): Promise<void>;
}
