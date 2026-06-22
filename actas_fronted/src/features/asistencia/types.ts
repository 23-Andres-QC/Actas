export interface Inasistente {
  usuarioId: string;
  nombre: string;
  email: string;
  evidenciaUrl: string | null;
}

export type MetodoAsistencia = 'qr' | 'firma_facial' | 'biometrico';

export interface AsistenteFirmado {
  usuarioId: string;
  nombre: string;
  email: string;
  cargo: string | null;
  metodo: MetodoAsistencia;
  fechaHora: string;
  firmaUrl: string | null;
}
