import { eventBus } from "./EventBus";
import { EventType } from "./EventTypes";
import { NotificationHandler } from "./handlers/NotificationHandler";
import { LogHandler } from "./handlers/LogHandler";

export function registerEventHandlers() {
  Object.values(EventType).forEach((type) => {
    eventBus.subscribe(type, NotificationHandler);
    eventBus.subscribe(type, LogHandler);
  });
}