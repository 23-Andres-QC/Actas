import { ActaRepository } from '../../domain/acta.repository';
import { AvanceAcuerdosProvider } from '../../domain/avance-acuerdos.provider';
import { NotFoundError } from '../../../../shared/errors/domain-error';
import { ActaResponseDTO, toActaResponseDTO } from '../dto/acta.dto';

export class CalcularAvanceUseCase {
  constructor(
    private readonly actaRepository: ActaRepository,
    private readonly avanceAcuerdosProvider: AvanceAcuerdosProvider,
  ) {}

  public async execute(actaId: string): Promise<ActaResponseDTO> {
    const acta = await this.actaRepository.findById(actaId);
    if (!acta) {
      throw new NotFoundError('Acta', actaId);
    }

    const porcentajes = await this.avanceAcuerdosProvider.obtenerPorcentajesPorActa(actaId);
    acta.actualizarAvance(porcentajes);
    await this.actaRepository.save(acta);

    return toActaResponseDTO(acta);
  }
}
