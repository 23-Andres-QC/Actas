import { ActaRepository } from '../../domain/acta.repository';
import { StoragePort } from '../../../evidencia/domain/storage.port';
import { ACTAS_BUCKET } from '../../../../infrastructure/supabase/client';
import { extraerPathDesdeUrlFirmada } from '../../../../infrastructure/supabase/extraer-path';
import { NotFoundError, ValidationError } from '../../../../shared/errors/domain-error';

const TIPOS_PERMITIDOS = ['application/pdf', 'image/png', 'image/jpeg'];
const TAMANO_MAXIMO_BYTES = 15 * 1024 * 1024; // 15 MB

interface ArchivoInput {
  buffer: Buffer;
  mimeType: string;
}

export class SubirActaFisicaUseCase {
  constructor(
    private readonly actaRepository: ActaRepository,
    private readonly storage: StoragePort,
  ) {}

  public async execute(actaId: string, archivo: ArchivoInput): Promise<{ urlActaFisica: string }> {
    const acta = await this.actaRepository.findById(actaId);
    if (!acta) {
      throw new NotFoundError('Acta', actaId);
    }
    if (!TIPOS_PERMITIDOS.includes(archivo.mimeType)) {
      throw new ValidationError(`Tipo de archivo no permitido: ${archivo.mimeType}`);
    }
    if (archivo.buffer.byteLength > TAMANO_MAXIMO_BYTES) {
      throw new ValidationError('El archivo excede el tamaño máximo de 15MB');
    }

    const pathAnterior = extraerPathDesdeUrlFirmada(ACTAS_BUCKET, acta.urlActaFisica);

    const extension = archivo.mimeType === 'application/pdf' ? 'pdf' : archivo.mimeType.split('/')[1];
    const path = `${actaId}/acta-fisica-${Date.now()}.${extension}`;
    const url = await this.storage.subirArchivo(ACTAS_BUCKET, path, archivo.buffer, archivo.mimeType);

    acta.registrarActaFisica(url);
    await this.actaRepository.save(acta);

    if (pathAnterior) {
      await this.storage.eliminarArchivo(ACTAS_BUCKET, pathAnterior);
    }

    return { urlActaFisica: url };
  }
}
