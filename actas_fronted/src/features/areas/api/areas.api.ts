import { httpClient } from '../../../shared/api/http-client';
import { Area } from '../types';

export const areasApi = {
  listar: () => httpClient.get<Area[]>('/areas'),
  crear: (nombre: string) => httpClient.post<Area>('/areas', { nombre }),
};
