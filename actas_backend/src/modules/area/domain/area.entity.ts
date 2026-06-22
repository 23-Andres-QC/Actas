import { Entity } from '../../../shared/kernel/entity';
import { randomUUID } from 'crypto';

interface AreaProps { nombre: string }

export class Area extends Entity<AreaProps> {
  private constructor(props: AreaProps, id: string) { super(props, id); }
  public static create(nombre: string, id: string = randomUUID()): Area { return new Area({ nombre }, id); }
  public get nombre(): string { return this.props.nombre; }
}
