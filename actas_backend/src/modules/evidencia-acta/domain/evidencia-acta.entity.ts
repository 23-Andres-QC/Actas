import { Entity } from '../../../shared/kernel/entity';

export type TipoEvidencia = 'archivo' | 'link';

interface EvidenciaActaProps {
  actaId: string;
  urlArchivo: string;
  tipo: TipoEvidencia;
  fechaSubida: Date;
}

export class EvidenciaActa extends Entity<EvidenciaActaProps> {
  private constructor(props: EvidenciaActaProps, id: string) {
    super(props, id);
  }

  public static subir(props: Omit<EvidenciaActaProps, 'fechaSubida'>, id: string): EvidenciaActa {
    return new EvidenciaActa({ ...props, fechaSubida: new Date() }, id);
  }

  public static reconstruir(props: EvidenciaActaProps, id: string): EvidenciaActa {
    return new EvidenciaActa(props, id);
  }

  public get actaId(): string {
    return this.props.actaId;
  }

  public get urlArchivo(): string {
    return this.props.urlArchivo;
  }

  public get tipo(): TipoEvidencia {
    return this.props.tipo;
  }

  public get fechaSubida(): Date {
    return this.props.fechaSubida;
  }
}
