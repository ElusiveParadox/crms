import { BaseEvent } from "../BaseEvent";

export async function LogHandler(event: BaseEvent) {
  console.log("Event Log:", event.type, event.timestamp);
}