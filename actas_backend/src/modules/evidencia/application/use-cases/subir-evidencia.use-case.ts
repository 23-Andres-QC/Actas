import { randomUUID } from 'crypto';
import { EvidenciaRepository } from '../../domain/evidencia.repository';
import { Evidencia } from '../../domain/evidencia.entity';
import { StoragePort } from '../../domain/storage.port';
import { AcuerdoRepository } from '../../../acuerdo/domain/acuerdo.repository';
import { ValidationError, NotFoundError, ForbiddenError } from '../../../../shared/errors/domain-error';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { EVIDENCIAS_BUCKET } from '../../../../infrastructure/supabase/client';

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'application/pdf', 'video/mp4'];
const TAMANO_MAXIMO_BYTES = 25 * 1024 * 1024; // 25 MB
const ROLES_SUPERVISORES: Rol[] = ['superadmin', 'admin', 'convocador'];

interface DatosComunes {
  acuerdoId: string;
  ejecutadoPorId: string;
  ejecutadoPorRol: Rol;
}

type SubirEvidenciaInput =
  | (DatosComunes & { tipo: 'archivo'; archivo: Buffer; mimeType: string; nombreArchivo: string })
  | (DatosComunes & { tipo: 'link'; url: string });

export class SubirEvidenciaUseCase {
  constructor(
    private readonly evidenciaRepository: EvidenciaRepository,
    private readonly storage: StoragePort,
    private readonly acuerdoRepository: AcuerdoRepository,
  ) {}

  public async execute(input: SubirEvidenciaInput): Promise<void> {
    const acuerdo = await this.acuerdoRepository.findById(input.acuerdoId);
    if (!acuerdo) {
      throw new NotFoundError('Acuerdo', input.acuerdoId);
    }

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
      const path = `${input.acuerdoId}/${randomUUID()}-${input.nombreArchivo}`;
      url = await this.storage.subirArchivo(EVIDENCIAS_BUCKET, path, input.archivo, input.mimeType);
    }

    const evidencia = Evidencia.subir({ acuerdoId: input.acuerdoId, urlArchivo: url, tipo: input.tipo }, randomUUID());
    await this.evidenciaRepository.save(evidencia);
  }
}
