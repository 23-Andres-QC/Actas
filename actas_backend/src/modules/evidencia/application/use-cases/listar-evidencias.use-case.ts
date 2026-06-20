import { EvidenciaRepository } from '../../domain/evidencia.repository';

export class ListarEvidenciasUseCase {
  constructor(private readonly evidenciaRepository: EvidenciaRepository) {}

  public async execute(acuerdoId: string) {
    const evidencias = await this.evidenciaRepository.findByAcuerdoId(acuerdoId);
    return evidencias.map((e) => ({
      id: e.id,
      acuerdoId: e.acuerdoId,
      urlArchivo: e.urlArchivo,
      fechaSubida: e.fechaSubida.toISOString(),
    }));
  }
}
