import { Usuario } from '../../domain/usuario.entity';
import { UsuarioListadoInfo } from '../../domain/usuario.repository';

export interface UsuarioResponseDTO {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  areaId: string | null;
  areaNombre: string | null;
  esJefe: boolean;
  cargo: string | null;
}

export function toUsuarioResponseDTO(usuario: Usuario): UsuarioResponseDTO {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol.value,
    areaId: usuario.areaId,
    areaNombre: null,
    esJefe: usuario.esJefe,
    cargo: usuario.cargo,
  };
}

export function toUsuarioListadoDTO(info: UsuarioListadoInfo): UsuarioResponseDTO {
  return {
    id: info.id,
    nombre: info.nombre,
    email: info.email,
    rol: info.rol,
    areaId: info.areaId,
    areaNombre: info.areaNombre,
    esJefe: info.esJefe,
    cargo: info.cargo,
  };
}
