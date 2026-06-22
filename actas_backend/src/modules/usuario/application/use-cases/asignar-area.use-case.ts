import { ForbiddenError, NotFoundError } from '../../../../shared/errors/domain-error';
import { Rol as RolSesion } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { UsuarioRepository } from '../../domain/usuario.repository';
import { UsuarioResponseDTO, toUsuarioResponseDTO } from '../dto/usuario.dto';

interface AsignarAreaInput {
  usuarioObjetivoId: string;
  areaId: string | null;
  esJefe: boolean;
  ejecutadoPorRol: RolSesion;
}

export class AsignarAreaUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  public async execute(input: AsignarAreaInput): Promise<UsuarioResponseDTO> {
    if (input.ejecutadoPorRol !== 'superadmin') {
      throw new ForbiddenError('Solo el SuperAdmin puede asignar áreas');
    }

    const usuario = await this.usuarioRepository.findById(input.usuarioObjetivoId);
    if (!usuario) throw new NotFoundError('Usuario', input.usuarioObjetivoId);

    if (input.areaId === null) {
      usuario.removerDeArea();
      await this.usuarioRepository.save(usuario);
      return toUsuarioResponseDTO(usuario);
    }

    if (input.esJefe) {
      // Demote existing jefe of that area before promoting the new one
      const jefeActual = await this.usuarioRepository.findJefeByAreaId(input.areaId);
      if (jefeActual && jefeActual.id !== usuario.id) {
        jefeActual.asignarArea(input.areaId, false);
        await this.usuarioRepository.save(jefeActual);
      }
    }

    usuario.asignarArea(input.areaId, input.esJefe);
    await this.usuarioRepository.save(usuario);
    return toUsuarioResponseDTO(usuario);
  }
}
