import { randomUUID } from 'crypto';
import { AcuerdoRepository } from '../../domain/acuerdo.repository';
import { Acuerdo } from '../../domain/acuerdo.entity';
import { CrearAcuerdoDTO, AcuerdoResponseDTO, toAcuerdoResponseDTO } from '../dto/acuerdo.dto';
import { UsuarioRepository } from '../../../usuario/domain/usuario.repository';
import { NotFoundError } from '../../../../shared/errors/domain-error';

export class CrearAcuerdoUseCase {
  constructor(private readonly acuerdoRepository: AcuerdoRepository, private readonly usuarioRepository: UsuarioRepository) {}

  public async execute(input: CrearAcuerdoDTO): Promise<AcuerdoResponseDTO> {
    const responsable = await this.usuarioRepository.findById(input.responsableId);
    if (!responsable) throw new NotFoundError('Usuario responsable', input.responsableId);
    const acuerdo = Acuerdo.crear(
      {
        actaId: input.actaId,
        responsableId: input.responsableId,
        descripcion: input.descripcion,
        fechaInicio: new Date(input.fechaInicio),
        fechaFin: new Date(input.fechaFin),
      },
      randomUUID(),
    );

    await this.acuerdoRepository.save(acuerdo);
    return toAcuerdoResponseDTO(acuerdo, responsable.nombre);
  }
}
