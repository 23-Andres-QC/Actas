import { AccionRepository } from '../../domain/accion.repository';
import { AccionResponseDTO, toAccionResponseDTO } from '../dto/accion.dto';

export class ListarAccionesPorAcuerdoUseCase {
  constructor(private readonly accionRepository: AccionRepository) {}

  public async execute(acuerdoId: string): Promise<AccionResponseDTO[]> {
    const acciones = await this.accionRepository.findByAcuerdoId(acuerdoId);
    return acciones.map(toAccionResponseDTO);
  }
}
