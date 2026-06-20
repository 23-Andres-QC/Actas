import { DomainEvent } from '../kernel/domain-event';
import { logger } from '../logger/logger';

type Handler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void;

class EventBus {
  private handlers = new Map<string, Handler[]>();

  public subscribe<T extends DomainEvent>(eventName: string, handler: Handler<T>): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler as Handler);
    this.handlers.set(eventName, existing);
  }

  public async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.name) ?? [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        logger.error({ err: error, event: event.name }, 'Error al procesar evento de dominio');
      }
    }
  }

  public async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
}

export const eventBus = new EventBus();
