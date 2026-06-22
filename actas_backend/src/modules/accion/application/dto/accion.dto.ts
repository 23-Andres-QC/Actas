import { Accion } from '../../domain/accion.entity';

export interface AccionResponseDTO {
  id: string;
  acuerdoId: string;
  descripcion: string;
  fechaFin: string;
  completada: boolean;
}

export function toAccionResponseDTO(accion: Accion): AccionResponseDTO {
  return {
    id: accion.id,
    acuerdoId: accion.acuerdoId,
    descripcion: accion.descripcion,
    fechaFin: accion.fechaFin.toISOString(),
    completada: accion.completada,
  };
}
