import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../../../shared/errors/domain-error';
import { UsuarioRepository } from '../../domain/usuario.repository';
import { toUsuarioResponseDTO, UsuarioResponseDTO } from '../dto/usuario.dto';

interface AuthResponse {
  token: string;
  usuario: UsuarioResponseDTO;
}

export class AutenticarUsuarioUseCase {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  public async execute(email: string, password: string): Promise<AuthResponse> {
    const usuario = await this.usuarioRepository.findByEmail(email);
    if (!usuario || !(await compare(password, usuario.passwordHash))) {
      throw new UnauthorizedError('Correo o contraseña incorrectos');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET no está configurado');
    const token = jwt.sign(
      { email: usuario.email, rol: usuario.rol.value },
      secret,
      { subject: usuario.id, expiresIn: '8h' },
    );
    return { token, usuario: toUsuarioResponseDTO(usuario) };
  }
}
