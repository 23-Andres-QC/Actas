import { randomUUID } from 'crypto';
import { InasistenteRepository } from '../../domain/inasistente.entity';
import { StoragePort } from '../../../evidencia/domain/storage.port';
import { EVIDENCIAS_BUCKET } from '../../../../infrastructure/supabase/client';
import { ValidationError } from '../../../../shared/errors/domain-error';

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'application/pdf'];
const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024; // 10 MB

interface ArchivoInput {
  buffer: Buffer;
  mimeType: string;
}

export class SubirEvidenciaInasistenciaUseCase {
  constructor(
    private readonly inasistenteRepository: InasistenteRepository,
    private readonly storage: StoragePort,
  ) {}

  public async execute(actaId: string, usuarioId: string, archivo: ArchivoInput): Promise<{ evidenciaUrl: string }> {
    if (!TIPOS_PERMITIDOS.includes(archivo.mimeType)) {
      throw new ValidationError(`Tipo de archivo no permitido: ${archivo.mimeType}`);
    }
    if (archivo.buffer.byteLength > TAMANO_MAXIMO_BYTES) {
      throw new ValidationError('El archivo excede el tamaño máximo de 10MB');
    }

    const extension = archivo.mimeType === 'application/pdf' ? 'pdf' : 'png';
    const path = `inasistencias/${actaId}/${usuarioId}-${randomUUID()}.${extension}`;
    const url = await this.storage.subirArchivo(EVIDENCIAS_BUCKET, path, archivo.buffer, archivo.mimeType);
    await this.inasistenteRepository.guardarEvidencia(actaId, usuarioId, url);

    return { evidenciaUrl: url };
  }
}
