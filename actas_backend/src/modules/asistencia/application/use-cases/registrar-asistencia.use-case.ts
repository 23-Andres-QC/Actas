import { randomUUID } from 'crypto';
import { AsistenciaRepository } from '../../domain/asistencia.repository';
import { Asistencia, MetodoAsistencia } from '../../domain/asistencia.entity';
import { ActaRepository } from '../../../acta/domain/acta.repository';
import { StoragePort } from '../../../evidencia/domain/storage.port';
import { FIRMAS_BUCKET } from '../../../../infrastructure/supabase/client';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../../shared/errors/domain-error';
import { RegenerarDocumentoEditableUseCase } from '../../../acta/application/use-cases/regenerar-documento-editable.use-case';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';

const TIPOS_FIRMA_PERMITIDOS = ['image/png', 'image/jpeg'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB
const METODOS_QUE_REQUIEREN_TOKEN: MetodoAsistencia[] = ['qr', 'biometrico'];

interface FirmaInput {
  buffer: Buffer;
  mimeType: string;
}

export class RegistrarAsistenciaUseCase {
  constructor(
    private readonly asistenciaRepository: AsistenciaRepository,
    private readonly storage: StoragePort,
    private readonly actaRepository: ActaRepository,
    private readonly regenerarDocumentoEditable?: RegenerarDocumentoEditableUseCase,
  ) {}

  public async execute(
    actaId: string,
    usuarioId: string,
    metodo: MetodoAsistencia,
    ejecutadoPorRol: Rol,
    firma?: FirmaInput,
    qrToken?: string,
  ): Promise<{ firmaUrl: string | null }> {
    if (METODOS_QUE_REQUIEREN_TOKEN.includes(metodo)) {
      const acta = await this.actaRepository.findById(actaId);
      if (!acta) throw new NotFoundError('Acta', actaId);
      if (!qrToken || qrToken !== acta.qrToken) {
        throw new ForbiddenError('El código QR no corresponde a esta acta');
      }
    }

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

    try {
      await this.regenerarDocumentoEditable?.execute(actaId, usuarioId, ejecutadoPorRol);
    } catch (error) {
      console.error('No se pudo regenerar el documento editable tras registrar la asistencia:', error);
    }

    return { firmaUrl: asistencia.firmaUrl };
  }
}
