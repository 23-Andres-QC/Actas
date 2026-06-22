import { httpClient } from '../../../shared/api/http-client';
import { CrearUsuarioInput, Usuario } from '../types';

export const usuariosApi = {
  listar: (areaId?: string) => httpClient.get<Usuario[]>(`/usuarios${areaId ? `?areaId=${areaId}` : ''}`),
  crear: (input: CrearUsuarioInput) => httpClient.post<Usuario>('/usuarios', input),
  asignarRol: (usuarioId: string, rol: Usuario['rol']) =>
    httpClient.patch<Usuario>(`/usuarios/${usuarioId}/rol`, { rol }),
};
