export type TipoReunion = 'interna' | 'externa';
export type Proceso = 'estrategico' | 'operativo' | 'soporte';

export interface Acta {
  id: string;
  areaId: string;
  convocadorId: string;
  titulo: string;
  fecha: string;
  formato: 'estandar' | 'ai';
  tipoReunion: TipoReunion;
  proceso: Proceso;
  lugar: string;
  horaInicio: string;
  horaFin: string;
  objetivo: string;
  agenda: string;
  urlGrabacion: string | null;
  urlActaFisica: string | null;
  porcentajeAvance: number;
}

export interface CrearActaInput {
  areaId: string;
  titulo: string;
  fecha: string;
  formato: 'estandar' | 'ai';
  tipoReunion: TipoReunion;
  proceso: Proceso;
  lugar: string;
  horaInicio: string;
  horaFin: string;
  objetivo: string;
  agenda: string;
}
