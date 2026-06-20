import { ActaRepository } from '../../domain/acta.repository';
import { ActaResponseDTO, toActaResponseDTO } from '../dto/acta.dto';

export class ListarActasUseCase {
  constructor(private readonly actaRepository: ActaRepository) {}

  public async execute(filtro?: { areaId?: string }): Promise<ActaResponseDTO[]> {
    const actas = await this.actaRepository.findAll(filtro);
    return actas.map(toActaResponseDTO);
  }
}
