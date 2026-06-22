import { httpClient } from '../../../shared/api/http-client';
import { AsistenteFirmado, Inasistente } from '../types';

export const asistenciaApi = {
  listarAsistentesFirmados: (actaId: string) => httpClient.get<AsistenteFirmado[]>(`/actas/${actaId}/asistencia`),
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
