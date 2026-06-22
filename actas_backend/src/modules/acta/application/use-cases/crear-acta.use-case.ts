import { randomUUID } from 'crypto';
import { ActaRepository } from '../../domain/acta.repository';
import { Acta } from '../../domain/acta.entity';
import { eventBus } from '../../../../shared/events/event-bus';
import { CrearActaDTO, ActaResponseDTO, toActaResponseDTO } from '../dto/acta.dto';

export class CrearActaUseCase {
  constructor(private readonly actaRepository: ActaRepository) {}

  public async execute(input: CrearActaDTO): Promise<ActaResponseDTO> {
    const acta = Acta.crear(
      {
        areaId: input.areaId,
        convocadorId: input.convocadorId,
        titulo: input.titulo,
        fecha: new Date(input.fecha),
        formato: input.formato,
        tipoReunion: input.tipoReunion,
        proceso: input.proceso,
        lugar: input.lugar,
        horaInicio: input.horaInicio,
        horaFin: input.horaFin,
        objetivo: input.objetivo,
        agenda: input.agenda,
      },
      randomUUID(),
    );

    await this.actaRepository.save(acta);
    await eventBus.publishAll(acta.pullEvents());

    return toActaResponseDTO(acta);
  }
}
