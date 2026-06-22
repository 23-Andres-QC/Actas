import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { acuerdosApi } from '../api/acuerdos.api';
import { CrearAcuerdoInput } from '../types';

export function useAcuerdosPorActa(actaId: string) {
  return useQuery({
    queryKey: ['acuerdos', actaId],
    queryFn: () => acuerdosApi.listarPorActa(actaId),
    enabled: Boolean(actaId),
  });
}

export function useCrearAcuerdo(actaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearAcuerdoInput) => acuerdosApi.crear(actaId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['acuerdos', actaId] }),
  });
}

export function useEvidenciasAcuerdo(acuerdoId: string) {
  return useQuery({ queryKey: ['evidencias', acuerdoId], queryFn: () => acuerdosApi.listarEvidencias(acuerdoId), enabled: Boolean(acuerdoId) });
}

export function useSubirEvidenciaAcuerdo(acuerdoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (archivo: File) => acuerdosApi.subirEvidencia(acuerdoId, archivo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evidencias', acuerdoId] }),
  });
}
