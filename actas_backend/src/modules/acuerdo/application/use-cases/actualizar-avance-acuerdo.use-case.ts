import { AcuerdoRepository } from '../../domain/acuerdo.repository';
import { NotFoundError } from '../../../../shared/errors/domain-error';
import { AcuerdoResponseDTO, toAcuerdoResponseDTO } from '../dto/acuerdo.dto';

export class ActualizarAvanceAcuerdoUseCase {
  constructor(private readonly acuerdoRepository: AcuerdoRepository) {}

  public async execute(acuerdoId: string, nuevoPorcentaje: number): Promise<AcuerdoResponseDTO> {
    const acuerdo = await this.acuerdoRepository.findById(acuerdoId);
    if (!acuerdo) {
      throw new NotFoundError('Acuerdo', acuerdoId);
    }

    acuerdo.actualizarAvance(nuevoPorcentaje);
    await this.acuerdoRepository.save(acuerdo);

    // TODO: publicar evento AcuerdoActualizado y disparar recálculo de Acta.porcentajeAvance
    return toAcuerdoResponseDTO(acuerdo);
  }
}
