import { Entity } from '../../../shared/kernel/entity';

export type MetodoAsistencia = 'qr' | 'firma_facial';

interface AsistenciaProps {
  actaId: string;
  usuarioId: string;
  metodo: MetodoAsistencia;
  fechaHora: Date;
  firmaUrl: string | null;
}

export class Asistencia extends Entity<AsistenciaProps> {
  private constructor(props: AsistenciaProps, id: string) {
    super(props, id);
  }

  public static registrar(props: Omit<AsistenciaProps, 'fechaHora' | 'firmaUrl'>, id: string): Asistencia {
    return new Asistencia({ ...props, fechaHora: new Date(), firmaUrl: null }, id);
  }

  public static reconstruir(props: AsistenciaProps, id: string): Asistencia {
    return new Asistencia(props, id);
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

  public get firmaUrl(): string | null {
    return this.props.firmaUrl;
  }

  public registrarFirma(url: string): void {
    this.props.firmaUrl = url;
  }
}
