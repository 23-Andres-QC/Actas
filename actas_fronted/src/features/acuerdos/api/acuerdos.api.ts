import { httpClient } from '../../../shared/api/http-client';
import { Acuerdo, CrearAcuerdoInput, EvidenciaAcuerdo } from '../types';

export const acuerdosApi = {
  listarPorActa: (actaId: string) => httpClient.get<Acuerdo[]>(`/actas/${actaId}/acuerdos`),
  crear: (actaId: string, input: CrearAcuerdoInput) => httpClient.post<Acuerdo>(`/actas/${actaId}/acuerdos`, input),
  actualizarAvance: (id: string, porcentajeAvance: number) =>
    httpClient.patch<Acuerdo>(`/acuerdos/${id}/avance`, { porcentajeAvance }),
  listarEvidencias: (acuerdoId: string) => httpClient.get<EvidenciaAcuerdo[]>(`/acuerdos/${acuerdoId}/evidencias`),
  subirEvidencia: (acuerdoId: string, archivo: File) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return httpClient.post<{ ok: true }>(`/acuerdos/${acuerdoId}/evidencias`, formData);
  },
  subirEvidenciaLink: (acuerdoId: string, url: string) =>
    httpClient.post<{ ok: true }>(`/acuerdos/${acuerdoId}/evidencias`, { url }),
};
