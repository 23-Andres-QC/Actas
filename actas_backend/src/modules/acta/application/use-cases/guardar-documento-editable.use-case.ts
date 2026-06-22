import { randomUUID } from 'crypto';
import { ActaDocumentoRepository } from '../../domain/acta-documento.repository';
import { StoragePort } from '../../../evidencia/domain/storage.port';
import { ACTAS_BUCKET } from '../../../../infrastructure/supabase/client';
import { NotFoundError } from '../../../../shared/errors/domain-error';

const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/** Llamado desde el callback de OnlyOffice cuando hay cambios para guardar. */
export class GuardarDocumentoEditableUseCase {
  constructor(
    private readonly actaDocumentoRepository: ActaDocumentoRepository,
    private readonly storage: StoragePort,
  ) {}

  public async execute(actaId: string, urlDocumentoEditado: string): Promise<void> {
    const info = await this.actaDocumentoRepository.findByActaId(actaId);
    if (!info) throw new NotFoundError('Documento editable', actaId);

    const respuesta = await fetch(urlDocumentoEditado);
    if (!respuesta.ok) {
      throw new Error(`No se pudo descargar el documento editado desde OnlyOffice: HTTP ${respuesta.status}`);
    }
    const buffer = Buffer.from(await respuesta.arrayBuffer());

    await this.storage.reemplazarArchivo(ACTAS_BUCKET, info.path, buffer, MIME_DOCX);
    await this.actaDocumentoRepository.guardar({ ...info, version: randomUUID(), updatedAt: new Date() });
  }
}
