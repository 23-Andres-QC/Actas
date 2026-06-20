import { ActaRepository } from '../../domain/acta.repository';
import { NotFoundError } from '../../../../shared/errors/domain-error';
import { ActaResponseDTO, toActaResponseDTO } from '../dto/acta.dto';

export class ObtenerActaUseCase {
  constructor(private readonly actaRepository: ActaRepository) {}

  public async execute(id: string): Promise<ActaResponseDTO> {
    const acta = await this.actaRepository.findById(id);
    if (!acta) {
      throw new NotFoundError('Acta', id);
    }
    return toActaResponseDTO(acta);
  }
}
