import { useQuery } from '@tanstack/react-query';
import { acuerdosApi } from '../api/acuerdos.api';

export function useAcuerdosPorActa(actaId: string) {
  return useQuery({
    queryKey: ['acuerdos', actaId],
    queryFn: () => acuerdosApi.listarPorActa(actaId),
    enabled: Boolean(actaId),
  });
}
