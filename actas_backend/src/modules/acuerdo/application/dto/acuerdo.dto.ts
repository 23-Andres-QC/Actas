import { Acuerdo } from '../../domain/acuerdo.entity';

export interface AcuerdoResponseDTO {
  id: string;
  actaId: string;
  responsableId: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estadoSemaforo: string;
  porcentajeAvance: number;
}

export interface CrearAcuerdoDTO {
  actaId: string;
  responsableId: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
}

export function toAcuerdoResponseDTO(acuerdo: Acuerdo): AcuerdoResponseDTO {
  return {
    id: acuerdo.id,
    actaId: acuerdo.actaId,
    responsableId: acuerdo.responsableId,
    descripcion: acuerdo.descripcion,
    fechaInicio: acuerdo.fechaInicio.toISOString(),
    fechaFin: acuerdo.fechaFin.toISOString(),
    estadoSemaforo: acuerdo.estadoSemaforo.value,
    porcentajeAvance: acuerdo.porcentajeAvance.value,
  };
}
