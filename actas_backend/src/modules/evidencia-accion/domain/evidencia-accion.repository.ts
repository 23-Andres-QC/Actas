import { EvidenciaAccion } from './evidencia-accion.entity';

export interface EvidenciaAccionRepository {
  findByAccionId(accionId: string): Promise<EvidenciaAccion[]>;
  save(evidencia: EvidenciaAccion): Promise<void>;
}
