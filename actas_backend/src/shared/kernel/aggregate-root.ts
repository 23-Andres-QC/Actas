import { Entity } from './entity';
import { DomainEvent } from './domain-event';

export abstract class AggregateRoot<Props> extends Entity<Props> {
  private domainEvents: DomainEvent[] = [];

  protected addEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  public pullEvents(): DomainEvent[] {
    const events = this.domainEvents;
    this.domainEvents = [];
    return events;
  }
}
