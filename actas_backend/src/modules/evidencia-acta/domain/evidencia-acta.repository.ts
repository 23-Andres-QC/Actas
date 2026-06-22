import { EvidenciaActa } from './evidencia-acta.entity';

export interface EvidenciaActaRepository {
  findByActaId(actaId: string): Promise<EvidenciaActa[]>;
  save(evidencia: EvidenciaActa): Promise<void>;
}
