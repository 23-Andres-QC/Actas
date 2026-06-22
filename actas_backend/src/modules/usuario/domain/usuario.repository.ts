import { Usuario } from './usuario.entity';

/**
 * Puerto del dominio: la implementación (Postgres) vive en infrastructure/.
 * El dominio y los casos de uso solo conocen esta interfaz.
 */
export interface UsuarioRepository {
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findAll(filtro?: { areaId?: string }): Promise<Usuario[]>;
  save(usuario: Usuario): Promise<void>;
}
