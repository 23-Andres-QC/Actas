import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { actasApi } from '../api/actas.api';
import { CrearActaInput } from '../types';

export function useActas(areaId?: string) {
  return useQuery({
    queryKey: ['actas', areaId],
    queryFn: () => actasApi.listar(areaId),
  });
}

export function useActa(id: string) {
  return useQuery({
    queryKey: ['actas', id],
    queryFn: () => actasApi.detalle(id),
    enabled: Boolean(id),
  });
}

export function useCrearActa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearActaInput) => actasApi.crear(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actas'] });
    },
  });
}

export function useSubirActaFisica() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, archivo }: { id: string; archivo: File }) => actasApi.subirActaFisica(id, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actas'] });
    },
  });
}
