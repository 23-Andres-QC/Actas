import { ActaRepository } from '../../domain/acta.repository';
import { UsuarioRepository } from '../../../usuario/domain/usuario.repository';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { NotFoundError } from '../../../../shared/errors/domain-error';
import { ActaResponseDTO, toActaResponseDTO } from '../dto/acta.dto';

export class ObtenerActaUseCase {
  constructor(
    private readonly actaRepository: ActaRepository,
    private readonly usuarioRepository: UsuarioRepository,
  ) {}

  public async execute(id: string, ejecutadoPorId: string, ejecutadoPorRol: Rol): Promise<ActaResponseDTO> {
    const acta = await this.actaRepository.findById(id);
    if (!acta) {
      throw new NotFoundError('Acta', id);
    }

    if (ejecutadoPorRol !== 'superadmin') {
      const ejecutor = await this.usuarioRepository.findById(ejecutadoPorId);
      if (ejecutor?.areaId !== acta.areaId) {
        throw new NotFoundError('Acta', id);
      }
    }

    const convocador = await this.usuarioRepository.findById(acta.convocadorId);
    return toActaResponseDTO(acta, convocador?.nombre);
  }
}
