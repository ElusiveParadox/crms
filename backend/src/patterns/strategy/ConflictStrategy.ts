import { Booking } from "../../models/Booking";

export interface ConflictStrategy {
  hasConflict(newBooking: Booking, existing: Booking[]): boolean;
}