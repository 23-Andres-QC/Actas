import { randomUUID } from 'crypto';
import { AsistenciaRepository } from '../../domain/asistencia.repository';
import { Asistencia, MetodoAsistencia } from '../../domain/asistencia.entity';
import { StoragePort } from '../../../evidencia/domain/storage.port';
import { FIRMAS_BUCKET } from '../../../../infrastructure/supabase/client';
import { ValidationError } from '../../../../shared/errors/domain-error';

const TIPOS_FIRMA_PERMITIDOS = ['image/png', 'image/jpeg'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

interface FirmaInput {
  buffer: Buffer;
  mimeType: string;
}

export class RegistrarAsistenciaUseCase {
  constructor(
    private readonly asistenciaRepository: AsistenciaRepository,
    private readonly storage: StoragePort,
  ) {}

  public async execute(
    actaId: string,
    usuarioId: string,
    metodo: MetodoAsistencia,
    firma?: FirmaInput,
  ): Promise<{ firmaUrl: string | null }> {
    const asistencia = Asistencia.registrar({ actaId, usuarioId, metodo }, randomUUID());

    if (firma) {
      if (!TIPOS_FIRMA_PERMITIDOS.includes(firma.mimeType)) {
        throw new ValidationError(`Tipo de imagen no permitido para la firma: ${firma.mimeType}`);
      }
      if (firma.buffer.byteLength > TAMANO_MAXIMO_BYTES) {
        throw new ValidationError('La imagen de la firma excede el tamaño máximo de 5MB');
      }
      const path = `${usuarioId}/${asistencia.id}.png`;
      const url = await this.storage.subirArchivo(FIRMAS_BUCKET, path, firma.buffer, firma.mimeType);
      asistencia.registrarFirma(url);
    }

    await this.asistenciaRepository.save(asistencia);
    return { firmaUrl: asistencia.firmaUrl };
  }
}
