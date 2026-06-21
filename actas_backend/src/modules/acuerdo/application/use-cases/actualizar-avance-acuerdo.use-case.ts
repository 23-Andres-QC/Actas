import { AcuerdoRepository } from '../../domain/acuerdo.repository';
import { ActaRepository } from '../../../acta/domain/acta.repository';
import { AvanceAcuerdosProvider } from '../../../acta/domain/avance-acuerdos.provider';
import { NotFoundError, ForbiddenError } from '../../../../shared/errors/domain-error';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { AcuerdoResponseDTO, toAcuerdoResponseDTO } from '../dto/acuerdo.dto';

/** Roles con visión de supervisión: pueden actualizar el avance de cualquier acuerdo. */
const ROLES_SUPERVISORES: Rol[] = ['superadmin', 'admin', 'convocador'];

export class ActualizarAvanceAcuerdoUseCase {
  constructor(
    private readonly acuerdoRepository: AcuerdoRepository,
    private readonly actaRepository: ActaRepository,
    private readonly avanceAcuerdosProvider: AvanceAcuerdosProvider,
  ) {}

  public async execute(
    acuerdoId: string,
    nuevoPorcentaje: number,
    ejecutadoPorId: string,
    ejecutadoPorRol: Rol,
  ): Promise<AcuerdoResponseDTO> {
    const acuerdo = await this.acuerdoRepository.findById(acuerdoId);
    if (!acuerdo) {
      throw new NotFoundError('Acuerdo', acuerdoId);
    }

    const esResponsable = acuerdo.responsableId === ejecutadoPorId;
    if (!esResponsable && !ROLES_SUPERVISORES.includes(ejecutadoPorRol)) {
      throw new ForbiddenError('Solo el responsable del acuerdo o un supervisor pueden actualizar su avance');
    }

    acuerdo.actualizarAvance(nuevoPorcentaje);
    await this.acuerdoRepository.save(acuerdo);

    await this.recalcularAvanceActa(acuerdo.actaId);

    return toAcuerdoResponseDTO(acuerdo);
  }

  /** Mantiene el % del acta sincronizado con sus acuerdos cada vez que uno cambia (antes quedaba desactualizado). */
  private async recalcularAvanceActa(actaId: string): Promise<void> {
    const acta = await this.actaRepository.findById(actaId);
    if (!acta) return;

    const porcentajes = await this.avanceAcuerdosProvider.obtenerPorcentajesPorActa(actaId);
    acta.actualizarAvance(porcentajes);
    await this.actaRepository.save(acta);
  }
}
