export interface InasistenteInfo {
  usuarioId: string;
  nombre: string;
  email: string;
  evidenciaUrl: string | null;
}

/** Puerto: calcula qué usuarios del área del acta no registraron asistencia. */
export interface InasistentesProvider {
  obtenerPorActa(actaId: string): Promise<InasistenteInfo[]>;
}

/** Puerto: persiste la evidencia de justificación de inasistencia. */
export interface InasistenteRepository {
  guardarEvidencia(actaId: string, usuarioId: string, evidenciaUrl: string): Promise<void>;
}
