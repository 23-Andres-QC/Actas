import { ForbiddenError } from '../../../../shared/errors/domain-error';
import { UsuarioRepository } from '../../domain/usuario.repository';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { UsuarioResponseDTO, toUsuarioListadoDTO } from '../dto/usuario.dto';

interface ListarUsuariosInput {
  ejecutadoPorId: string;
  ejecutadoPorRol: Rol;
}

export class ListarUsuariosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  public async execute(input: ListarUsuariosInput): Promise<UsuarioResponseDTO[]> {
    if (input.ejecutadoPorRol === 'superadmin') {
      const todos = await this.usuarioRepository.findAllListado();
      return todos.map(toUsuarioListadoDTO);
    }

    const ejecutor = await this.usuarioRepository.findById(input.ejecutadoPorId);
    const puedeVerSuArea =
      ejecutor?.esJefe || input.ejecutadoPorRol === 'admin' || input.ejecutadoPorRol === 'convocador';
    if (!puedeVerSuArea || !ejecutor?.areaId) {
      throw new ForbiddenError('Solo el SuperAdmin, el jefe de un área, un Admin o un Convocador pueden ver usuarios de su área');
    }

    const desuArea = await this.usuarioRepository.findAllListado({ areaId: ejecutor.areaId });
    return desuArea.map(toUsuarioListadoDTO);
  }
}
