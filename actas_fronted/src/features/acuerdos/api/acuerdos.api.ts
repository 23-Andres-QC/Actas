import { httpClient } from '../../../shared/api/http-client';
import { Acuerdo } from '../types';

export const acuerdosApi = {
  listarPorActa: (actaId: string) => httpClient.get<Acuerdo[]>(`/actas/${actaId}/acuerdos`),
  actualizarAvance: (id: string, porcentajeAvance: number) =>
    httpClient.patch<Acuerdo>(`/acuerdos/${id}/avance`, { porcentajeAvance }),
  // TODO: subirEvidencia se implementa en features/evidencias junto con el endpoint multipart
};
