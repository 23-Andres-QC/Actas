import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../api/usuarios.api';
import { Usuario } from '../types';

export function useUsuarios(areaId?: string) {
  return useQuery({
    queryKey: ['usuarios', areaId],
    queryFn: () => usuariosApi.listar(areaId),
  });
}

export function useAsignarRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, rol }: { usuarioId: string; rol: Usuario['rol'] }) =>
      usuariosApi.asignarRol(usuarioId, rol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
