import { AcuerdoRepository } from '../../domain/acuerdo.repository';
import { AcuerdoResponseDTO, toAcuerdoResponseDTO } from '../dto/acuerdo.dto';

export class ListarAcuerdosPorActaUseCase {
  constructor(private readonly acuerdoRepository: AcuerdoRepository) {}

  public async execute(actaId: string): Promise<AcuerdoResponseDTO[]> {
    const acuerdos = await this.acuerdoRepository.findByActaId(actaId);
    return acuerdos.map(toAcuerdoResponseDTO);
  }
}
