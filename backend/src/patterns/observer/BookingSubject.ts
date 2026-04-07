import { Observer } from "./Observer";
import { Booking } from "../../models/Booking";

export class BookingSubject {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    this.observers.push(observer);
  }

  notify(booking: Booking): void {
    this.observers.forEach((observer) => observer.update(booking));
  }
}