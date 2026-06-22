import { randomUUID } from 'crypto';
import { AccionRepository } from '../../domain/accion.repository';
import { Accion } from '../../domain/accion.entity';
import { AcuerdoRepository } from '../../../acuerdo/domain/acuerdo.repository';
import { Acuerdo } from '../../../acuerdo/domain/acuerdo.entity';
import { RecalcularAvanceActaService } from '../../../acuerdo/application/services/recalcular-avance-acta.service';
import { NotFoundError, ForbiddenError } from '../../../../shared/errors/domain-error';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { AccionResponseDTO, toAccionResponseDTO } from '../dto/accion.dto';

const ROLES_SUPERVISORES: Rol[] = ['superadmin', 'admin', 'convocador'];

export class CrearAccionUseCase {
  constructor(
    private readonly accionRepository: AccionRepository,
    private readonly acuerdoRepository: AcuerdoRepository,
    private readonly recalcularAvanceActaService: RecalcularAvanceActaService,
  ) {}

  public async execute(
    acuerdoId: string,
    descripcion: string,
    fechaFin: string,
    ejecutadoPorId: string,
    ejecutadoPorRol: Rol,
  ): Promise<AccionResponseDTO> {
    const acuerdo = await this.acuerdoRepository.findById(acuerdoId);
    if (!acuerdo) throw new NotFoundError('Acuerdo', acuerdoId);

    const esResponsable = acuerdo.responsableId === ejecutadoPorId;
    if (!esResponsable && !ROLES_SUPERVISORES.includes(ejecutadoPorRol)) {
      throw new ForbiddenError('Solo el responsable del acuerdo o un supervisor pueden agregar acciones');
    }

    const accion = Accion.crear({ acuerdoId, descripcion, fechaFin: new Date(fechaFin) }, randomUUID());
    await this.accionRepository.save(accion);
    await this.recalcularAvanceAcuerdo(acuerdo);

    return toAccionResponseDTO(accion);
  }

  /** El % del acuerdo ahora se deriva de sus acciones: completadas / total. */
  private async recalcularAvanceAcuerdo(acuerdo: Acuerdo): Promise<void> {
    const acciones = await this.accionRepository.findByAcuerdoId(acuerdo.id);
    const total = acciones.length;
    const completadas = acciones.filter((a) => a.completada).length;
    acuerdo.actualizarAvance(total === 0 ? 0 : (completadas / total) * 100);
    await this.acuerdoRepository.save(acuerdo);
    await this.recalcularAvanceActaService.ejecutar(acuerdo.actaId);
  }
}
