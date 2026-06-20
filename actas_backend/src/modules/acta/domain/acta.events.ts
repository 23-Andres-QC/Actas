import { DomainEvent } from '../../../shared/kernel/domain-event';

export class ActaCreadaEvent extends DomainEvent {
  public readonly name = 'acta.creada';

  constructor(
    public readonly actaId: string,
    public readonly areaId: string,
    public readonly convocadorId: string,
  ) {
    super();
  }
}
