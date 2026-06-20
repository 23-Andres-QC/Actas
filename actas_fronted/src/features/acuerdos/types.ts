export interface Acuerdo {
  id: string;
  actaId: string;
  responsableId: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estadoSemaforo: 'verde' | 'amarillo' | 'rojo';
  porcentajeAvance: number;
}
