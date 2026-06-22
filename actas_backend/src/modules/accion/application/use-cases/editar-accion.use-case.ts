import { AccionRepository } from '../../domain/accion.repository';
import { AccionResponseDTO, toAccionResponseDTO } from '../dto/accion.dto';
import { NotFoundError } from '../../../../shared/errors/domain-error';

export interface EditarAccionInput {
  descripcion?: string;
  fechaFin?: string;
}

export class EditarAccionUseCase {
  constructor(private readonly accionRepository: AccionRepository) {}

  public async execute(id: string, input: EditarAccionInput): Promise<AccionResponseDTO> {
    const accion = await this.accionRepository.findById(id);
    if (!accion) throw new NotFoundError('Accion', id);

    accion.editar({
      descripcion: input.descripcion,
      fechaFin: input.fechaFin ? new Date(input.fechaFin) : undefined,
    });

    await this.accionRepository.save(accion);
    return toAccionResponseDTO(accion);
  }
}
