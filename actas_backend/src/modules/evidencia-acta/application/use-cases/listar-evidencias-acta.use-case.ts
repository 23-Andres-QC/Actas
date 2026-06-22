import { EvidenciaActaRepository } from '../../domain/evidencia-acta.repository';

export class ListarEvidenciasActaUseCase {
  constructor(private readonly evidenciaActaRepository: EvidenciaActaRepository) {}

  public async execute(actaId: string) {
    const evidencias = await this.evidenciaActaRepository.findByActaId(actaId);
    return evidencias.map((e) => ({
      id: e.id,
      actaId: e.actaId,
      urlArchivo: e.urlArchivo,
      tipo: e.tipo,
      fechaSubida: e.fechaSubida.toISOString(),
    }));
  }
}
