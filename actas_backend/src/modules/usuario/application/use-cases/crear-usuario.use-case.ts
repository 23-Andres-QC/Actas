import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import { ConflictError, ForbiddenError } from '../../../../shared/errors/domain-error';
import { Rol as RolSesion } from '../../../../infrastructure/http/middlewares/auth.middleware';
import { Usuario } from '../../domain/usuario.entity';
import { UsuarioRepository } from '../../domain/usuario.repository';
import { Rol } from '../../domain/value-objects/rol.vo';
import { toUsuarioResponseDTO, UsuarioResponseDTO } from '../dto/usuario.dto';

interface CrearUsuarioInput {
  nombre: string;
  email: string;
  password: string;
  rol: string;
  areaId: string | null;
  cargo: string | null;
  ejecutadoPorRol: RolSesion;
}

export class CrearUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  public async execute(input: CrearUsuarioInput): Promise<UsuarioResponseDTO> {
    if (input.ejecutadoPorRol !== 'superadmin') {
      throw new ForbiddenError('Solo el SuperAdmin puede crear usuarios');
    }
    if (await this.usuarioRepository.findByEmail(input.email)) {
      throw new ConflictError('Ya existe un usuario con este correo');
    }

    const usuario = Usuario.create(
      {
        nombre: input.nombre,
        email: input.email.toLowerCase(),
        passwordHash: await hash(input.password, 12),
        rol: Rol.create(input.rol),
        areaId: input.areaId,
        esJefe: false,
        cargo: input.cargo,
      },
      randomUUID(),
    );
    await this.usuarioRepository.save(usuario);
    return toUsuarioResponseDTO(usuario);
  }
}
