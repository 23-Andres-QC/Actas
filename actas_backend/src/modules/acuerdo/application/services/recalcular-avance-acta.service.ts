import { ActaRepository } from '../../../acta/domain/acta.repository';
import { AvanceAcuerdosProvider } from '../../../acta/domain/avance-acuerdos.provider';

/** Mantiene el % del acta sincronizado con sus acuerdos; usado tras cualquier cambio de avance. */
export class RecalcularAvanceActaService {
  constructor(
    private readonly actaRepository: ActaRepository,
    private readonly avanceAcuerdosProvider: AvanceAcuerdosProvider,
  ) {}

  public async ejecutar(actaId: string): Promise<void> {
    const acta = await this.actaRepository.findById(actaId);
    if (!acta) return;

    const porcentajes = await this.avanceAcuerdosProvider.obtenerPorcentajesPorActa(actaId);
    acta.actualizarAvance(porcentajes);
    await this.actaRepository.save(acta);
  }
}
