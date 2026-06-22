import { Entity } from '../../../shared/kernel/entity';

interface AccionProps {
  acuerdoId: string;
  descripcion: string;
  fechaFin: Date;
  completada: boolean;
}

export class Accion extends Entity<AccionProps> {
  private constructor(props: AccionProps, id: string) {
    super(props, id);
  }

  public static crear(props: Omit<AccionProps, 'completada'>, id: string): Accion {
    return new Accion({ ...props, completada: false }, id);
  }

  public static reconstruir(props: AccionProps, id: string): Accion {
    return new Accion(props, id);
  }

  public get acuerdoId(): string {
    return this.props.acuerdoId;
  }

  public get descripcion(): string {
    return this.props.descripcion;
  }

  public get fechaFin(): Date {
    return this.props.fechaFin;
  }

  public get completada(): boolean {
    return this.props.completada;
  }

  public marcarCompletada(completada: boolean): void {
    this.props.completada = completada;
  }

  public editar(campos: { descripcion?: string; fechaFin?: Date }): void {
    if (campos.descripcion !== undefined) this.props.descripcion = campos.descripcion;
    if (campos.fechaFin !== undefined) this.props.fechaFin = campos.fechaFin;
  }
}
