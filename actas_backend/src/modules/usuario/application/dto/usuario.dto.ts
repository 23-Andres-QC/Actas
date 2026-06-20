import { Usuario } from '../../domain/usuario.entity';

export interface UsuarioResponseDTO {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  areaId: string | null;
  cargo: string | null;
}

export function toUsuarioResponseDTO(usuario: Usuario): UsuarioResponseDTO {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol.value,
    areaId: usuario.areaId,
    cargo: usuario.cargo,
  };
}
