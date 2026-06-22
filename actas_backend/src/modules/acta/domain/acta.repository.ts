import { Acta } from './acta.entity';

export interface ActaRepository {
  findById(id: string): Promise<Acta | null>;
  findAll(filtro?: { areaId?: string }): Promise<Acta[]>;
  save(acta: Acta): Promise<void>;
  /** Fija la lista de invitados al momento de crear la acta (no se vuelve a tocar después). */
  guardarInvitados(actaId: string, usuarioIds: string[]): Promise<void>;
}
