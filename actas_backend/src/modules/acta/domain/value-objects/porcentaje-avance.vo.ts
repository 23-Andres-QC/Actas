import { ValidationError } from '../../../../shared/errors/domain-error';

export class PorcentajeAvance {
  private constructor(public readonly value: number) {}

  public static create(value: number): PorcentajeAvance {
    if (value < 0 || value > 100) {
      throw new ValidationError('El porcentaje de avance debe estar entre 0 y 100');
    }
    return new PorcentajeAvance(Math.round(value * 100) / 100);
  }

  /** % del acta = acuerdos cumplidos (100%) / total acuerdos. */
  public static promedio(valores: number[]): PorcentajeAvance {
    if (valores.length === 0) return PorcentajeAvance.create(0);
    const cumplidos = valores.filter((v) => v >= 100).length;
    return PorcentajeAvance.create((cumplidos / valores.length) * 100);
  }
}
