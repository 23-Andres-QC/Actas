import { AcuerdoRepository } from '../../domain/acuerdo.repository';
import { ActaRepository } from '../../../acta/domain/acta.repository';
import { AcuerdoResponseDTO, toAcuerdoResponseDTO } from '../dto/acuerdo.dto';

export interface MiAcuerdoResponseDTO extends AcuerdoResponseDTO {
  actaTitulo: string;
}

/** Usado por mobile: "mis acuerdos" — todos los compromisos asignados al usuario autenticado, sin importar el acta. */
export class ListarAcuerdosPorResponsableUseCase {
  constructor(
    private readonly acuerdoRepository: AcuerdoRepository,
    private readonly actaRepository: ActaRepository,
  ) {}

  public async execute(responsableId: string): Promise<MiAcuerdoResponseDTO[]> {
    const acuerdos = await this.acuerdoRepository.findByResponsableId(responsableId);

    const actaIds = [...new Set(acuerdos.map((a) => a.actaId))];
    const actas = await Promise.all(actaIds.map((id) => this.actaRepository.findById(id)));
    const tituloPorActaId = new Map(actas.filter((a) => a !== null).map((a) => [a!.id, a!.titulo]));

    return acuerdos.map((acuerdo) => ({
      ...toAcuerdoResponseDTO(acuerdo),
      actaTitulo: tituloPorActaId.get(acuerdo.actaId) ?? '',
    }));
  }
}
