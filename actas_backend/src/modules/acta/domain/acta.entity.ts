import { AggregateRoot } from '../../../shared/kernel/aggregate-root';
import { PorcentajeAvance } from './value-objects/porcentaje-avance.vo';
import { ActaCreadaEvent } from './acta.events';

export type FormatoActa = 'estandar' | 'ai';
export type TipoReunion = 'interna' | 'externa';
export type Proceso = 'estrategico' | 'operativo' | 'soporte';

interface ActaProps {
  areaId: string;
  convocadorId: string;
  titulo: string;
  fecha: Date;
  formato: FormatoActa;
  tipoReunion: TipoReunion;
  proceso: Proceso;
  lugar: string;
  horaInicio: string;
  horaFin: string;
  objetivo: string;
  agenda: string;
  urlGrabacion: string | null;
  urlActaFisica: string | null;
  porcentajeAvance: PorcentajeAvance;
}

export class Acta extends AggregateRoot<ActaProps> {
  private constructor(props: ActaProps, id: string) {
    super(props, id);
  }

  public static crear(
    props: Omit<ActaProps, 'porcentajeAvance' | 'urlGrabacion' | 'urlActaFisica'>,
    id: string,
  ): Acta {
    const acta = new Acta(
      { ...props, urlGrabacion: null, urlActaFisica: null, porcentajeAvance: PorcentajeAvance.create(0) },
      id,
    );
    acta.addEvent(new ActaCreadaEvent(id, props.areaId, props.convocadorId));
    return acta;
  }

  public static reconstruir(props: ActaProps, id: string): Acta {
    return new Acta(props, id);
  }

  public get areaId(): string {
    return this.props.areaId;
  }

  public get convocadorId(): string {
    return this.props.convocadorId;
  }

  public get titulo(): string {
    return this.props.titulo;
  }

  public get fecha(): Date {
    return this.props.fecha;
  }

  public get formato(): FormatoActa {
    return this.props.formato;
  }

  public get tipoReunion(): TipoReunion {
    return this.props.tipoReunion;
  }

  public get proceso(): Proceso {
    return this.props.proceso;
  }

  public get lugar(): string {
    return this.props.lugar;
  }

  public get horaInicio(): string {
    return this.props.horaInicio;
  }

  public get horaFin(): string {
    return this.props.horaFin;
  }

  public get objetivo(): string {
    return this.props.objetivo;
  }

  public get agenda(): string {
    return this.props.agenda;
  }

  public get urlGrabacion(): string | null {
    return this.props.urlGrabacion;
  }

  public get urlActaFisica(): string | null {
    return this.props.urlActaFisica;
  }

  public get porcentajeAvance(): PorcentajeAvance {
    return this.props.porcentajeAvance;
  }

  public actualizarAvance(avanceAcuerdos: number[]): void {
    this.props.porcentajeAvance = PorcentajeAvance.promedio(avanceAcuerdos);
  }

  public registrarGrabacion(url: string): void {
    this.props.urlGrabacion = url;
  }

  public registrarActaFisica(url: string): void {
    this.props.urlActaFisica = url;
  }
}
