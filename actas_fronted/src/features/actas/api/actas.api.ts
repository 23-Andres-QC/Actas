import { httpClient } from '../../../shared/api/http-client';
import { Acta, CrearActaInput } from '../types';

export const actasApi = {
  listar: (areaId?: string) => httpClient.get<Acta[]>(`/actas${areaId ? `?areaId=${areaId}` : ''}`),
  detalle: (id: string) => httpClient.get<Acta>(`/actas/${id}`),
  crear: (input: CrearActaInput) => httpClient.post<Acta>('/actas', input),
  recalcularAvance: (id: string) => httpClient.get<{ porcentajeAvance: number }>(`/actas/${id}/avance`),
  descargarWord: (id: string) => httpClient.getBlob(`/actas/${id}/word`),
  obtenerDocumentoEditable: (id: string) =>
    httpClient.get<{ documentServerUrl: string; config: Record<string, unknown> }>(`/actas/${id}/documento-editable`),
  subirActaFisica: (id: string, archivo: File) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return httpClient.post<{ urlActaFisica: string }>(`/actas/${id}/acta-fisica`, formData);
  },
};
