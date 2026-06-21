import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { asistenciaApi } from '../api/asistencia.api';

export function useInasistentes(actaId: string) {
  return useQuery({
    queryKey: ['inasistentes', actaId],
    queryFn: () => asistenciaApi.listarInasistentes(actaId),
    enabled: Boolean(actaId),
  });
}

export function useSubirEvidenciaInasistencia(actaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ usuarioId, archivo }: { usuarioId: string; archivo: File }) =>
      asistenciaApi.subirEvidenciaInasistencia(actaId, usuarioId, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inasistentes', actaId] });
    },
  });
}
