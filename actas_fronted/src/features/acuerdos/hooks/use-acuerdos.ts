import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { acuerdosApi } from '../api/acuerdos.api';
import { CrearAccionInput, CrearAcuerdoInput } from '../types';

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

export function useAccionesPorAcuerdo(acuerdoId: string) {
  return useQuery({
    queryKey: ['acciones', acuerdoId],
    queryFn: () => acuerdosApi.listarAcciones(acuerdoId),
    enabled: Boolean(acuerdoId),
  });
}

/** Crear/completar acciones recalcula en cascada el % del acuerdo y del acta (ver backend). */
function invalidarCascadaAvance(queryClient: ReturnType<typeof useQueryClient>, acuerdoId: string) {
  queryClient.invalidateQueries({ queryKey: ['acciones', acuerdoId] });
  queryClient.invalidateQueries({ queryKey: ['acuerdos'] });
  queryClient.invalidateQueries({ queryKey: ['actas'] });
}

export function useCrearAccion(acuerdoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CrearAccionInput) => acuerdosApi.crearAccion(acuerdoId, input),
    onSuccess: () => invalidarCascadaAvance(queryClient, acuerdoId),
  });
}

export function useActualizarCompletadaAccion(acuerdoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completada }: { id: string; completada: boolean }) =>
      acuerdosApi.actualizarCompletadaAccion(id, completada),
    onSuccess: () => invalidarCascadaAvance(queryClient, acuerdoId),
  });
}

export function useEvidenciasAccion(accionId: string) {
  return useQuery({
    queryKey: ['evidencias-accion', accionId],
    queryFn: () => acuerdosApi.listarEvidenciasAccion(accionId),
    enabled: Boolean(accionId),
  });
}

export function useSubirEvidenciaAccion(accionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (archivo: File) => acuerdosApi.subirEvidenciaAccion(accionId, archivo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evidencias-accion', accionId] }),
  });
}

export function useSubirEvidenciaAccionLink(accionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => acuerdosApi.subirEvidenciaAccionLink(accionId, url),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evidencias-accion', accionId] }),
  });
}
