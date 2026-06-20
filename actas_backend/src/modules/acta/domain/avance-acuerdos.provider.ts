/**
 * Puerto de integración entre el contexto Acta y el contexto Acuerdo:
 * el dominio Acta no depende del módulo acuerdo directamente, solo de
 * este contrato. La implementación vive en infrastructure/ y delega
 * en el repositorio de acuerdos.
 */
export interface AvanceAcuerdosProvider {
  obtenerPorcentajesPorActa(actaId: string): Promise<number[]>;
}
