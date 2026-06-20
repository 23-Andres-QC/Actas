export type SemaforoValue = 'verde' | 'amarillo' | 'rojo';

export class Semaforo {
  private constructor(public readonly value: SemaforoValue) {}

  public static create(value: SemaforoValue): Semaforo {
    return new Semaforo(value);
  }

  /** Regla de negocio: deriva el semáforo a partir del avance y la fecha límite. */
  public static calcular(porcentajeAvance: number, fechaFin: Date, ahora: Date = new Date()): Semaforo {
    if (porcentajeAvance >= 100) return new Semaforo('verde');
    if (ahora > fechaFin) return new Semaforo('rojo');

    const diasRestantes = Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 3 && porcentajeAvance < 80) return new Semaforo('amarillo');

    return new Semaforo('verde');
  }
}
