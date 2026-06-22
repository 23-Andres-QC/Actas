import { FirmaUsuarioRepository } from '../../domain/firma-usuario.repository';
import { StoragePort } from '../../../evidencia/domain/storage.port';
import { FIRMAS_BUCKET } from '../../../../infrastructure/supabase/client';
import { extraerPathDesdeUrlFirmada } from '../../../../infrastructure/supabase/extraer-path';
import { ValidationError } from '../../../../shared/errors/domain-error';

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

interface ArchivoInput {
  buffer: Buffer;
  mimeType: string;
}

export class GuardarFirmaUsuarioUseCase {
  constructor(
    private readonly firmaUsuarioRepository: FirmaUsuarioRepository,
    private readonly storage: StoragePort,
  ) {}

  public async execute(usuarioId: string, archivo: ArchivoInput): Promise<{ firmaUrl: string }> {
    if (!TIPOS_PERMITIDOS.includes(archivo.mimeType)) {
      throw new ValidationError(`Tipo de imagen no permitido para la firma: ${archivo.mimeType}`);
    }
    if (archivo.buffer.byteLength > TAMANO_MAXIMO_BYTES) {
      throw new ValidationError('La imagen de la firma excede el tamaño máximo de 5MB');
    }

    const urlAnterior = await this.firmaUsuarioRepository.obtenerPorUsuario(usuarioId);
    const pathAnterior = extraerPathDesdeUrlFirmada(FIRMAS_BUCKET, urlAnterior);

    const path = `${usuarioId}/firma-${Date.now()}.png`;
    const url = await this.storage.subirArchivo(FIRMAS_BUCKET, path, archivo.buffer, archivo.mimeType);
    await this.firmaUsuarioRepository.guardar(usuarioId, url);

    if (pathAnterior) {
      await this.storage.eliminarArchivo(FIRMAS_BUCKET, pathAnterior);
    }

    return { firmaUrl: url };
  }
}
