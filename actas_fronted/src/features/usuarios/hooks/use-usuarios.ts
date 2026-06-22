import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../api/usuarios.api';
import { CrearUsuarioInput, Usuario } from '../types';

export function useUsuarios(areaId?: string) {
  return useQuery({
    queryKey: ['usuarios', areaId],
    queryFn: () => usuariosApi.listar(areaId),
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearUsuarioInput) => usuariosApi.crear(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['usuarios'] }),
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

export function useAsignarArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, areaId, esJefe }: { usuarioId: string; areaId: string | null; esJefe: boolean }) =>
      usuariosApi.asignarArea(usuarioId, areaId, esJefe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}
