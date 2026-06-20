import { Entity } from '../../../shared/kernel/entity';
import { Semaforo } from '../../acta/domain/value-objects/semaforo.vo';
import { PorcentajeAvance } from '../../acta/domain/value-objects/porcentaje-avance.vo';

interface AcuerdoProps {
  actaId: string;
  responsableId: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  estadoSemaforo: Semaforo;
  porcentajeAvance: PorcentajeAvance;
}

export class Acuerdo extends Entity<AcuerdoProps> {
  private constructor(props: AcuerdoProps, id: string) {
    super(props, id);
  }

  public static crear(
    props: Omit<AcuerdoProps, 'estadoSemaforo' | 'porcentajeAvance'>,
    id: string,
  ): Acuerdo {
    return new Acuerdo(
      { ...props, estadoSemaforo: Semaforo.create('verde'), porcentajeAvance: PorcentajeAvance.create(0) },
      id,
    );
  }

  public static reconstruir(props: AcuerdoProps, id: string): Acuerdo {
    return new Acuerdo(props, id);
  }

  public get actaId(): string {
    return this.props.actaId;
  }

  public get responsableId(): string {
    return this.props.responsableId;
  }

  public get descripcion(): string {
    return this.props.descripcion;
  }

  public get fechaInicio(): Date {
    return this.props.fechaInicio;
  }

  public get fechaFin(): Date {
    return this.props.fechaFin;
  }

  public get estadoSemaforo(): Semaforo {
    return this.props.estadoSemaforo;
  }

  public get porcentajeAvance(): PorcentajeAvance {
    return this.props.porcentajeAvance;
  }

  /** Recalcula el semáforo según el avance actual y la fecha límite (regla de negocio centralizada). */
  public actualizarAvance(nuevoPorcentaje: number): void {
    this.props.porcentajeAvance = PorcentajeAvance.create(nuevoPorcentaje);
    this.props.estadoSemaforo = Semaforo.calcular(nuevoPorcentaje, this.props.fechaFin);
  }
}
