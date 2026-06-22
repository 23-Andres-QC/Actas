import { Entity } from '../../../shared/kernel/entity';

export type TipoEvidencia = 'archivo' | 'link';

interface EvidenciaAccionProps {
  accionId: string;
  urlArchivo: string;
  tipo: TipoEvidencia;
  fechaSubida: Date;
}

export class EvidenciaAccion extends Entity<EvidenciaAccionProps> {
  private constructor(props: EvidenciaAccionProps, id: string) {
    super(props, id);
  }

  public static subir(props: Omit<EvidenciaAccionProps, 'fechaSubida'>, id: string): EvidenciaAccion {
    return new EvidenciaAccion({ ...props, fechaSubida: new Date() }, id);
  }

  public static reconstruir(props: EvidenciaAccionProps, id: string): EvidenciaAccion {
    return new EvidenciaAccion(props, id);
  }

  public get accionId(): string {
    return this.props.accionId;
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
