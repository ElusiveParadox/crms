import { Booking } from "../../models/Booking";

export interface BookingState {
  approve(booking: Booking): void;
  reject(booking: Booking): void;
  cancel(booking: Booking): void;
  getName(): string;
}