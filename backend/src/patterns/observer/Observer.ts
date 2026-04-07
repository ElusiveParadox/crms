import { Booking } from "../../models/Booking";

export interface Observer {
  update(booking: Booking): void;
}