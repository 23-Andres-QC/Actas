import { httpClient } from '../../../shared/api/http-client';
import { Accion, Acuerdo, CrearAccionInput, CrearAcuerdoInput, EvidenciaAccion, MiAcuerdo } from '../types';

export const acuerdosApi = {
  listarMios: () => httpClient.get<MiAcuerdo[]>('/acuerdos/mios'),
  listarPorActa: (actaId: string) => httpClient.get<Acuerdo[]>(`/actas/${actaId}/acuerdos`),
  crear: (actaId: string, input: CrearAcuerdoInput) => httpClient.post<Acuerdo>(`/actas/${actaId}/acuerdos`, input),
  actualizarAvance: (id: string, porcentajeAvance: number) =>
    httpClient.patch<Acuerdo>(`/acuerdos/${id}/avance`, { porcentajeAvance }),
  editarAcuerdo: (id: string, input: { descripcion?: string; responsableId?: string; fechaInicio?: string; fechaFin?: string }) =>
    httpClient.patch<Acuerdo>(`/acuerdos/${id}`, input),
  reordenarAcuerdos: (items: { id: string; orden: number }[]) =>
    httpClient.patch<{ ok: true }>('/acuerdos/reordenar', { items }),

  listarAcciones: (acuerdoId: string) => httpClient.get<Accion[]>(`/acuerdos/${acuerdoId}/acciones`),
  crearAccion: (acuerdoId: string, input: CrearAccionInput) => httpClient.post<Accion>(`/acuerdos/${acuerdoId}/acciones`, input),
  actualizarCompletadaAccion: (accionId: string, completada: boolean) =>
    httpClient.patch<Accion>(`/acciones/${accionId}/completada`, { completada }),
  editarAccion: (id: string, input: { descripcion?: string; fechaFin?: string }) =>
    httpClient.patch<Accion>(`/acciones/${id}`, input),
  reordenarAcciones: (items: { id: string; orden: number }[]) =>
    httpClient.patch<{ ok: true }>('/acciones/reordenar', { items }),

  listarEvidenciasAccion: (accionId: string) => httpClient.get<EvidenciaAccion[]>(`/acciones/${accionId}/evidencias`),
  subirEvidenciaAccion: (accionId: string, archivo: File) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return httpClient.post<{ ok: true }>(`/acciones/${accionId}/evidencias`, formData);
  },
  subirEvidenciaAccionLink: (accionId: string, url: string) =>
    httpClient.post<{ ok: true }>(`/acciones/${accionId}/evidencias`, { url }),
};
