import { UsuarioRepository } from '../../domain/usuario.repository';
import { UsuarioResponseDTO, toUsuarioResponseDTO } from '../dto/usuario.dto';

export class ListarUsuariosUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  public async execute(filtro?: { areaId?: string }): Promise<UsuarioResponseDTO[]> {
    const usuarios = await this.usuarioRepository.findAll(filtro);
    return usuarios.map(toUsuarioResponseDTO);
  }
}
