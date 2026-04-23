import { BaseEvent } from "../BaseEvent";

export async function NotificationHandler(event: BaseEvent) {
  console.log("Notification:", event.type, event.payload);
}