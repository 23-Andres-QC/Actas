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

export interface EvidenciaAcuerdo {
  id: string;
  acuerdoId: string;
  urlArchivo: string;
  tipo: 'archivo' | 'link';
  fechaSubida: string;
}
