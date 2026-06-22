import { randomUUID } from 'crypto';
import { EvidenciaAccionRepository } from '../../domain/evidencia-accion.repository';
import { EvidenciaAccion } from '../../domain/evidencia-accion.entity';
import { StoragePort } from '../../../evidencia/domain/storage.port';
import { AccionRepository } from '../../../accion/domain/accion.repository';
import { AcuerdoRepository } from '../../../acuerdo/domain/acuerdo.repository';
import { ValidationError, NotFoundError, ForbiddenError } from '../../../../shared/errors/domain-error';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { EVIDENCIAS_BUCKET } from '../../../../infrastructure/supabase/client';

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'application/pdf', 'video/mp4'];
const TAMANO_MAXIMO_BYTES = 25 * 1024 * 1024; // 25 MB
const ROLES_SUPERVISORES: Rol[] = ['superadmin', 'admin', 'convocador'];

interface DatosComunes {
  accionId: string;
  ejecutadoPorId: string;
  ejecutadoPorRol: Rol;
}

type SubirEvidenciaAccionInput =
  | (DatosComunes & { tipo: 'archivo'; archivo: Buffer; mimeType: string; nombreArchivo: string })
  | (DatosComunes & { tipo: 'link'; url: string });

export class SubirEvidenciaAccionUseCase {
  constructor(
    private readonly evidenciaAccionRepository: EvidenciaAccionRepository,
    private readonly storage: StoragePort,
    private readonly accionRepository: AccionRepository,
    private readonly acuerdoRepository: AcuerdoRepository,
  ) {}

  public async execute(input: SubirEvidenciaAccionInput): Promise<void> {
    const accion = await this.accionRepository.findById(input.accionId);
    if (!accion) throw new NotFoundError('Acción', input.accionId);

    const acuerdo = await this.acuerdoRepository.findById(accion.acuerdoId);
    if (!acuerdo) throw new NotFoundError('Acuerdo', accion.acuerdoId);

    const esResponsable = acuerdo.responsableId === input.ejecutadoPorId;
    if (!esResponsable && !ROLES_SUPERVISORES.includes(input.ejecutadoPorRol)) {
      throw new ForbiddenError('Solo el responsable del acuerdo o un supervisor pueden subir evidencia');
    }

    let url: string;
    if (input.tipo === 'link') {
      url = input.url;
    } else {
      if (!TIPOS_PERMITIDOS.includes(input.mimeType)) {
        throw new ValidationError(`Tipo de archivo no permitido: ${input.mimeType}`);
      }
      if (input.archivo.byteLength > TAMANO_MAXIMO_BYTES) {
        throw new ValidationError('El archivo excede el tamaño máximo de 25MB');
      }
      const path = `accion/${input.accionId}/${randomUUID()}-${input.nombreArchivo}`;
      url = await this.storage.subirArchivo(EVIDENCIAS_BUCKET, path, input.archivo, input.mimeType);
    }

    const evidencia = EvidenciaAccion.subir({ accionId: input.accionId, urlArchivo: url, tipo: input.tipo }, randomUUID());
    await this.evidenciaAccionRepository.save(evidencia);
  }
}
