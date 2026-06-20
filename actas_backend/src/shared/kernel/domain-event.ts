export abstract class DomainEvent {
  public readonly occurredAt: Date = new Date();
  public abstract readonly name: string;
}
