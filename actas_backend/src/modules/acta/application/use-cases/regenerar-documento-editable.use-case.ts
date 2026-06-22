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

/**
 * Reconstruye el .docx editable desde los datos actuales del acta (acuerdos, asistentes)
 * y lo sobrescribe en Supabase, a diferencia de ObtenerDocumentoEditableUseCase que solo
 * genera una vez. Se llama tanto automáticamente (al crear un acuerdo o completar una
 * acción) como manualmente desde el botón "Actualizar documento": en ambos casos pisa
 * cualquier edición manual que se haya hecho directamente en el editor.
 */
export class RegenerarDocumentoEditableUseCase {
  constructor(
    private readonly actaDocumentoRepository: ActaDocumentoRepository,
    private readonly obtenerActa: ObtenerActaUseCase,
    private readonly listarAcuerdosPorActa: ListarAcuerdosPorActaUseCase,
    private readonly listarAsistentesFirmados: ListarAsistentesFirmadosUseCase,
    private readonly storage: StoragePort,
  ) {}

  public async execute(actaId: string, ejecutadoPorId: string, ejecutadoPorRol: Rol): Promise<void> {
    const acta = await this.obtenerActa.execute(actaId, ejecutadoPorId, ejecutadoPorRol);
    const [acuerdos, asistentes] = await Promise.all([
      this.listarAcuerdosPorActa.execute(actaId),
      this.listarAsistentesFirmados.execute(actaId),
    ]);
    const buffer = await buildActaWordBuffer(acta, acuerdos, asistentes);
    const path = `${actaId}/documento-editable.docx`;
    await this.storage.reemplazarArchivo(ACTAS_BUCKET, path, buffer, MIME_DOCX);
    await this.actaDocumentoRepository.guardar({ actaId, path, version: randomUUID(), updatedAt: new Date() });
  }
}
