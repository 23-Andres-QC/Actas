import { UsuarioRepository } from '../../domain/usuario.repository';
import { Rol } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { UsuarioResponseDTO, toUsuarioResponseDTO } from '../dto/usuario.dto';

interface ListarUsuariosInput {
  areaId?: string;
  ejecutadoPorId: string;
  ejecutadoPorRol: Rol;
}

export class ListarUsuariosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  public async execute(input: ListarUsuariosInput): Promise<UsuarioResponseDTO[]> {
    let areaId = input.areaId;

    // Un Admin solo puede ver usuarios de su propia área, sin importar lo que pida por query param.
    if (input.ejecutadoPorRol === 'admin') {
      const ejecutor = await this.usuarioRepository.findById(input.ejecutadoPorId);
      areaId = ejecutor?.areaId ?? undefined;
    }

    const usuarios = await this.usuarioRepository.findAll({ areaId });
    return usuarios.map(toUsuarioResponseDTO);
  }
}
