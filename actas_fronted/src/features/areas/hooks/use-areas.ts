import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { areasApi } from '../api/areas.api';

export function useAreas() { return useQuery({ queryKey: ['areas'], queryFn: areasApi.listar }); }
export function useCrearArea() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: areasApi.crear, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['areas'] }) });
}
