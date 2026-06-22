import { AcuerdoRepository } from '../../domain/acuerdo.repository';
import { AcuerdoResponseDTO, toAcuerdoResponseDTO } from '../dto/acuerdo.dto';
import { UsuarioRepository } from '../../../usuario/domain/usuario.repository';
import { NotFoundError } from '../../../../shared/errors/domain-error';

export interface EditarAcuerdoInput {
  descripcion?: string;
  responsableId?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export class EditarAcuerdoUseCase {
  constructor(
    private readonly acuerdoRepository: AcuerdoRepository,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  public async execute(id: string, input: EditarAcuerdoInput): Promise<AcuerdoResponseDTO> {
    const acuerdo = await this.acuerdoRepository.findById(id);
    if (!acuerdo) throw new NotFoundError('Acuerdo', id);

    acuerdo.editar({
      descripcion: input.descripcion,
      responsableId: input.responsableId,
      fechaInicio: input.fechaInicio ? new Date(input.fechaInicio) : undefined,
      fechaFin: input.fechaFin ? new Date(input.fechaFin) : undefined,
    });

    await this.acuerdoRepository.save(acuerdo);

    const responsable = await this.usuarioRepository.findById(acuerdo.responsableId);
    return toAcuerdoResponseDTO(acuerdo, responsable?.nombre ?? 'Usuario no disponible');
  }
}
