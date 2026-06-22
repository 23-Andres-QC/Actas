import { EvidenciaAccionRepository } from '../../domain/evidencia-accion.repository';

export class ListarEvidenciasAccionUseCase {
  constructor(private readonly evidenciaAccionRepository: EvidenciaAccionRepository) {}

  public async execute(accionId: string) {
    const evidencias = await this.evidenciaAccionRepository.findByAccionId(accionId);
    return evidencias.map((e) => ({
      id: e.id,
      accionId: e.accionId,
      urlArchivo: e.urlArchivo,
      tipo: e.tipo,
      fechaSubida: e.fechaSubida.toISOString(),
    }));
  }
}
