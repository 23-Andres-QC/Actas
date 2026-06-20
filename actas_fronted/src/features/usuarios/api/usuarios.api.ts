import { httpClient } from '../../../shared/api/http-client';
import { Usuario } from '../types';

export const usuariosApi = {
  listar: (areaId?: string) => httpClient.get<Usuario[]>(`/usuarios${areaId ? `?areaId=${areaId}` : ''}`),
  asignarRol: (usuarioId: string, rol: Usuario['rol']) =>
    httpClient.patch<Usuario>(`/usuarios/${usuarioId}/rol`, { rol }),
};
