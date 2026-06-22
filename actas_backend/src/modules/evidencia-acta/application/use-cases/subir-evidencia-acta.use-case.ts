import { randomUUID } from 'crypto';
import { EvidenciaActaRepository } from '../../domain/evidencia-acta.repository';
import { EvidenciaActa } from '../../domain/evidencia-acta.entity';
import { StoragePort } from '../../../evidencia/domain/storage.port';
import { ActaRepository } from '../../../acta/domain/acta.repository';
import { ValidationError, NotFoundError } from '../../../../shared/errors/domain-error';
import { EVIDENCIAS_BUCKET } from '../../../../infrastructure/supabase/client';

/** Más permisivo que evidencia de acuerdo/acción: una evidencia de acta puede ser cualquier documento de la reunión. */
const TIPOS_PERMITIDOS = [
  'image/png', 'image/jpeg', 'image/webp', 'image/heic',
  'application/pdf', 'video/mp4', 'video/quicktime',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip', 'text/csv', 'text/plain',
];
const TAMANO_MAXIMO_BYTES = 25 * 1024 * 1024; // 25 MB

interface DatosComunes {
  actaId: string;
}

type SubirEvidenciaActaInput =
  | (DatosComunes & { tipo: 'archivo'; archivo: Buffer; mimeType: string; nombreArchivo: string })
  | (DatosComunes & { tipo: 'link'; url: string });

export class SubirEvidenciaActaUseCase {
  constructor(
    private readonly evidenciaActaRepository: EvidenciaActaRepository,
    private readonly storage: StoragePort,
    private readonly actaRepository: ActaRepository,
  ) {}

  public async execute(input: SubirEvidenciaActaInput): Promise<void> {
    const acta = await this.actaRepository.findById(input.actaId);
    if (!acta) throw new NotFoundError('Acta', input.actaId);

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
      const path = `acta/${input.actaId}/${randomUUID()}-${input.nombreArchivo}`;
      url = await this.storage.subirArchivo(EVIDENCIAS_BUCKET, path, input.archivo, input.mimeType);
    }

    const evidencia = EvidenciaActa.subir({ actaId: input.actaId, urlArchivo: url, tipo: input.tipo }, randomUUID());
    await this.evidenciaActaRepository.save(evidencia);
  }
}
