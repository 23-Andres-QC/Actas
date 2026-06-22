import { AcuerdoRepository } from '../../domain/acuerdo.repository';
import { AcuerdoResponseDTO, toAcuerdoResponseDTO } from '../dto/acuerdo.dto';
import { UsuarioRepository } from '../../../usuario/domain/usuario.repository';

export class ListarAcuerdosPorActaUseCase {
  constructor(private readonly acuerdoRepository: AcuerdoRepository, private readonly usuarioRepository: UsuarioRepository) {}

  public async execute(actaId: string): Promise<AcuerdoResponseDTO[]> {
    const acuerdos = await this.acuerdoRepository.findByActaId(actaId);
    return Promise.all(acuerdos.map(async (acuerdo) => {
      const responsable = await this.usuarioRepository.findById(acuerdo.responsableId);
      return toAcuerdoResponseDTO(acuerdo, responsable?.nombre ?? 'Usuario no disponible');
    }));
  }
}
