import { Acta, Proceso, TipoReunion } from '../../domain/acta.entity';

export interface ActaResponseDTO {
  id: string;
  areaId: string;
  convocadorId: string;
  convocadorNombre?: string;
  titulo: string;
  fecha: string;
  formato: string;
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

export interface CrearActaDTO {
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
}

export function toActaResponseDTO(acta: Acta, convocadorNombre?: string): ActaResponseDTO {
  return {
    id: acta.id,
    areaId: acta.areaId,
    convocadorId: acta.convocadorId,
    convocadorNombre,
    titulo: acta.titulo,
    fecha: acta.fecha.toISOString(),
    formato: acta.formato,
    tipoReunion: acta.tipoReunion,
    proceso: acta.proceso,
    lugar: acta.lugar,
    horaInicio: acta.horaInicio,
    horaFin: acta.horaFin,
    objetivo: acta.objetivo,
    agenda: acta.agenda,
    urlGrabacion: acta.urlGrabacion,
    urlActaFisica: acta.urlActaFisica,
    porcentajeAvance: acta.porcentajeAvance.value,
  };
}
