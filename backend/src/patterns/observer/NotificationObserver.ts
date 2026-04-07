import { Observer } from "./Observer";
import { Booking } from "../../models/Booking";

export class NotificationObserver implements Observer {
  update(booking: Booking): void {
    console.log(`Booking ${booking.id} changed to ${booking.getState()}`);
  }
}