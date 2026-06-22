import { randomUUID } from 'crypto';
import { ActaDocumentoRepository } from '../../domain/acta-documento.repository';
import { ObtenerActaUseCase } from './obtener-acta.use-case';
import { ListarAcuerdosPorActaUseCase } from '../../../acuerdo/application/use-cases/listar-acuerdos-por-acta.use-case';
import { ListarAsistentesFirmadosUseCase } from '../../../asistencia/application/use-cases/listar-asistentes-firmados.use-case';
import { StoragePort } from '../../../evidencia/domain/storage.port';
import { ACTAS_BUCKET } from '../../../../infrastructure/supabase/client';
import { buildActaWordBuffer } from '../../infrastructure/acta-word.builder';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';

const MIME_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export interface DocumentoEditableInfo {
  url: string;
  key: string;
  titulo: string;
}

/**
 * El .docx editable se genera UNA sola vez (con las firmas ya embebidas) y queda
 * persistido en Supabase; a partir de ahi las ediciones via OnlyOffice se guardan
 * sobre ese mismo archivo (ver GuardarDocumentoEditableUseCase), no se regenera
 * desde los datos del acta cada vez para no pisar cambios manuales.
 */
export class ObtenerDocumentoEditableUseCase {
  constructor(
    private readonly actaDocumentoRepository: ActaDocumentoRepository,
    private readonly obtenerActa: ObtenerActaUseCase,
    private readonly listarAcuerdosPorActa: ListarAcuerdosPorActaUseCase,
    private readonly listarAsistentesFirmados: ListarAsistentesFirmadosUseCase,
    private readonly storage: StoragePort,
  ) {}

  public async execute(actaId: string, ejecutadoPorId: string, ejecutadoPorRol: Rol): Promise<DocumentoEditableInfo> {
    const acta = await this.obtenerActa.execute(actaId, ejecutadoPorId, ejecutadoPorRol);

    const existente = await this.actaDocumentoRepository.findByActaId(actaId);
    if (existente) {
      const url = await this.storage.obtenerUrlFirmada(ACTAS_BUCKET, existente.path);
      return { url, key: existente.version, titulo: acta.titulo };
    }

    const [acuerdos, asistentes] = await Promise.all([
      this.listarAcuerdosPorActa.execute(actaId),
      this.listarAsistentesFirmados.execute(actaId),
    ]);
    const buffer = await buildActaWordBuffer(acta, acuerdos, asistentes);
    const path = `${actaId}/documento-editable.docx`;
    const url = await this.storage.subirArchivo(ACTAS_BUCKET, path, buffer, MIME_DOCX);
    const version = randomUUID();
    await this.actaDocumentoRepository.guardar({ actaId, path, version, updatedAt: new Date() });

    return { url, key: version, titulo: acta.titulo };
  }
}
