import { AccionRepository } from '../../domain/accion.repository';
import { AcuerdoRepository } from '../../../acuerdo/domain/acuerdo.repository';
import { RecalcularAvanceActaService } from '../../../acuerdo/application/services/recalcular-avance-acta.service';
import { NotFoundError, ForbiddenError } from '../../../../shared/errors/domain-error';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { AccionResponseDTO, toAccionResponseDTO } from '../dto/accion.dto';

const ROLES_SUPERVISORES: Rol[] = ['superadmin', 'admin', 'convocador'];

export class ActualizarCompletadaAccionUseCase {
  constructor(
    private readonly accionRepository: AccionRepository,
    private readonly acuerdoRepository: AcuerdoRepository,
    private readonly recalcularAvanceActaService: RecalcularAvanceActaService,
  ) {}

  public async execute(
    accionId: string,
    completada: boolean,
    ejecutadoPorId: string,
    ejecutadoPorRol: Rol,
  ): Promise<AccionResponseDTO> {
    const accion = await this.accionRepository.findById(accionId);
    if (!accion) throw new NotFoundError('Acción', accionId);

    const acuerdo = await this.acuerdoRepository.findById(accion.acuerdoId);
    if (!acuerdo) throw new NotFoundError('Acuerdo', accion.acuerdoId);

    const esResponsable = acuerdo.responsableId === ejecutadoPorId;
    if (!esResponsable && !ROLES_SUPERVISORES.includes(ejecutadoPorRol)) {
      throw new ForbiddenError('Solo el responsable del acuerdo o un supervisor pueden actualizar la acción');
    }

    accion.marcarCompletada(completada);
    await this.accionRepository.save(accion);

    const acciones = await this.accionRepository.findByAcuerdoId(acuerdo.id);
    const total = acciones.length;
    const completadas = acciones.filter((a) => a.completada).length;
    acuerdo.actualizarAvance(total === 0 ? 0 : (completadas / total) * 100);
    await this.acuerdoRepository.save(acuerdo);
    await this.recalcularAvanceActaService.ejecutar(acuerdo.actaId);

    return toAccionResponseDTO(accion);
  }
}
