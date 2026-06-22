export interface Acuerdo {
  id: string;
  actaId: string;
  responsableId: string;
  responsableNombre?: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estadoSemaforo: 'verde' | 'amarillo' | 'rojo';
  porcentajeAvance: number;
}

export interface CrearAcuerdoInput {
  responsableId: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface Accion {
  id: string;
  acuerdoId: string;
  descripcion: string;
  fechaFin: string;
  completada: boolean;
}

export interface CrearAccionInput {
  descripcion: string;
  fechaFin: string;
}

export interface EvidenciaAccion {
  id: string;
  accionId: string;
  urlArchivo: string;
  tipo: 'archivo' | 'link';
  fechaSubida: string;
}
