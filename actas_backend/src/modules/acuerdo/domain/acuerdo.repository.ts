import { Acuerdo } from './acuerdo.entity';

export interface AcuerdoRepository {
  findById(id: string): Promise<Acuerdo | null>;
  findByActaId(actaId: string): Promise<Acuerdo[]>;
  findByResponsableId(responsableId: string): Promise<Acuerdo[]>;
  findTieneEvidenciasByActaId(actaId: string): Promise<Map<string, boolean>>;
  save(acuerdo: Acuerdo): Promise<void>;
}
