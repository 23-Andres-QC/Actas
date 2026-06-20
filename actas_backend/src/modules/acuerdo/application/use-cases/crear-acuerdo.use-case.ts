import { randomUUID } from 'crypto';
import { AcuerdoRepository } from '../../domain/acuerdo.repository';
import { Acuerdo } from '../../domain/acuerdo.entity';
import { CrearAcuerdoDTO, AcuerdoResponseDTO, toAcuerdoResponseDTO } from '../dto/acuerdo.dto';

export class CrearAcuerdoUseCase {
  constructor(private readonly acuerdoRepository: AcuerdoRepository) {}

  public async execute(input: CrearAcuerdoDTO): Promise<AcuerdoResponseDTO> {
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
    return toAcuerdoResponseDTO(acuerdo);
  }
}
