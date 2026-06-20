import { ValidationError } from '../../../../shared/errors/domain-error';

export class PorcentajeAvance {
  private constructor(public readonly value: number) {}

  public static create(value: number): PorcentajeAvance {
    if (value < 0 || value > 100) {
      throw new ValidationError('El porcentaje de avance debe estar entre 0 y 100');
    }
    return new PorcentajeAvance(Math.round(value * 100) / 100);
  }

  /** Promedio del avance de una colección de acuerdos hijos del acta. */
  public static promedio(valores: number[]): PorcentajeAvance {
    if (valores.length === 0) return PorcentajeAvance.create(0);
    const promedio = valores.reduce((acc, v) => acc + v, 0) / valores.length;
    return PorcentajeAvance.create(promedio);
  }
}
