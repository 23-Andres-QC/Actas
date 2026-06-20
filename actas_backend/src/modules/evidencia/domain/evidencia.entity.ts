import { Entity } from '../../../shared/kernel/entity';

interface EvidenciaProps {
  acuerdoId: string;
  urlArchivo: string;
  fechaSubida: Date;
}

export class Evidencia extends Entity<EvidenciaProps> {
  private constructor(props: EvidenciaProps, id: string) {
    super(props, id);
  }

  public static subir(props: Omit<EvidenciaProps, 'fechaSubida'>, id: string): Evidencia {
    return new Evidencia({ ...props, fechaSubida: new Date() }, id);
  }

  public get acuerdoId(): string {
    return this.props.acuerdoId;
  }

  public get urlArchivo(): string {
    return this.props.urlArchivo;
  }

  public get fechaSubida(): Date {
    return this.props.fechaSubida;
  }
}
