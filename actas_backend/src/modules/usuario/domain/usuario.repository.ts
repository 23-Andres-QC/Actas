import { Usuario } from './usuario.entity';

export interface UsuarioListadoInfo {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  areaId: string | null;
  areaNombre: string | null;
  esJefe: boolean;
  cargo: string | null;
}

export interface UsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findAll(filtro?: { areaId?: string }): Promise<Usuario[]>;
  findAllListado(filtro?: { areaId?: string }): Promise<UsuarioListadoInfo[]>;
  findJefeByAreaId(areaId: string): Promise<Usuario | null>;
  save(usuario: Usuario): Promise<void>;
}
