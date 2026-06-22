import { randomUUID } from 'crypto';
import { ActaRepository } from '../../domain/acta.repository';
import { Acta } from '../../domain/acta.entity';
import { UsuarioRepository } from '../../../usuario/domain/usuario.repository';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { ForbiddenError } from '../../../../shared/errors/domain-error';
import { eventBus } from '../../../../shared/events/event-bus';
import { CrearActaDTO, ActaResponseDTO, toActaResponseDTO } from '../dto/acta.dto';

interface CrearActaInput extends CrearActaDTO {
  ejecutadoPorRol: Rol;
}

export class CrearActaUseCase {
  constructor(
    private readonly actaRepository: ActaRepository,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  public async execute(input: CrearActaInput): Promise<ActaResponseDTO> {
    if (input.ejecutadoPorRol !== 'superadmin') {
      const ejecutor = await this.usuarioRepository.findById(input.convocadorId);
      if (ejecutor?.areaId !== input.areaId) {
        throw new ForbiddenError('Solo puedes crear actas para tu propia área');
      }
    }

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
        urlReunion: input.urlReunion ?? null,
        qrToken: randomUUID(),
      },
      randomUUID(),
    );

    await this.actaRepository.save(acta);

    const invitadosIds = input.invitadosIds?.length
      ? input.invitadosIds
      : (await this.usuarioRepository.findAll({ areaId: input.areaId })).map((u) => u.id);
    await this.actaRepository.guardarInvitados(acta.id, invitadosIds);

    await eventBus.publishAll(acta.pullEvents());

    return toActaResponseDTO(acta);
  }
}
