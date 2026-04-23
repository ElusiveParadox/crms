import { BaseEvent } from "./BaseEvent";

type Handler<T = any> = (event: T) => Promise<void> | void;

export class EventBus {
  private handlers: Map<string, Handler[]> = new Map();

  subscribe(eventType: string, handler: Handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(handler);
  }

  async publish(event: BaseEvent) {
    const handlers = this.handlers.get(event.type) || [];

    await Promise.all(
      handlers.map((handler) => handler(event))
    );
  }
}

export const eventBus = new EventBus();