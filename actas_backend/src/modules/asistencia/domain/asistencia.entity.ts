import { Entity } from '../../../shared/kernel/entity';

export type MetodoAsistencia = 'qr' | 'firma_facial';

interface AsistenciaProps {
  actaId: string;
  usuarioId: string;
  metodo: MetodoAsistencia;
  fechaHora: Date;
}

export class Asistencia extends Entity<AsistenciaProps> {
  private constructor(props: AsistenciaProps, id: string) {
    super(props, id);
  }

  public static registrar(props: Omit<AsistenciaProps, 'fechaHora'>, id: string): Asistencia {
    return new Asistencia({ ...props, fechaHora: new Date() }, id);
  }

  public get actaId(): string {
    return this.props.actaId;
  }

  public get usuarioId(): string {
    return this.props.usuarioId;
  }

  public get metodo(): MetodoAsistencia {
    return this.props.metodo;
  }

  public get fechaHora(): Date {
    return this.props.fechaHora;
  }
}
