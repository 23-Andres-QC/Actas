import { NotFoundError, ForbiddenError } from '../../../../shared/errors/domain-error';
import { eventBus } from '../../../../shared/events/event-bus';
import { Rol } from '../../domain/value-objects/rol.vo';
import { Rol as RolSesion } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { UsuarioRepository } from '../../domain/usuario.repository';
import { UsuarioResponseDTO, toUsuarioResponseDTO } from '../dto/usuario.dto';
import { RolAsignadoEvent } from '../../domain/usuario.events';

interface AsignarRolInput {
  usuarioObjetivoId: string;
  nuevoRol: string;
  ejecutadoPorId: string;
  ejecutadoPorRol: RolSesion;
}

export class AsignarRolUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  public async execute(input: AsignarRolInput): Promise<UsuarioResponseDTO> {
    // SuperAdmin asigna Admins; Admin asigna Convocadores (ver docs/doc.md - roles)
    if (input.ejecutadoPorRol !== 'superadmin' && input.ejecutadoPorRol !== 'admin') {
      throw new ForbiddenError('Solo SuperAdmin o Admin pueden asignar roles');
    }
    if (input.ejecutadoPorRol === 'admin' && input.nuevoRol !== 'convocador') {
      throw new ForbiddenError('Un Admin solo puede asignar el rol de Convocador');
    }

    const usuario = await this.usuarioRepository.findById(input.usuarioObjetivoId);
    if (!usuario) {
      throw new NotFoundError('Usuario', input.usuarioObjetivoId);
    }

    usuario.cambiarRol(Rol.create(input.nuevoRol));
    await this.usuarioRepository.save(usuario);

    await eventBus.publish(
      new RolAsignadoEvent(usuario.id, input.nuevoRol, input.ejecutadoPorId),
    );

    return toUsuarioResponseDTO(usuario);
  }
}
