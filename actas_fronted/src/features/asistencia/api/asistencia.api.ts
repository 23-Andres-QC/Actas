import { httpClient } from '../../../shared/api/http-client';
import { Inasistente } from '../types';

export const asistenciaApi = {
  listarInasistentes: (actaId: string) => httpClient.get<Inasistente[]>(`/actas/${actaId}/asistencia/inasistentes`),
  subirEvidenciaInasistencia: (actaId: string, usuarioId: string, archivo: File) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return httpClient.post<{ evidenciaUrl: string }>(
      `/actas/${actaId}/asistencia/inasistentes/${usuarioId}/evidencia`,
      formData,
    );
  },
};
