import { Booking } from "../../models/Booking";
import { ConflictStrategy } from "./ConflictStrategy";

export class StrictConflictStrategy implements ConflictStrategy {
  hasConflict(newBooking: Booking, existing: Booking[]): boolean {
    return existing.some(
      (b) =>
        newBooking.resource === b.resource &&
        newBooking.startTime < b.endTime &&
        newBooking.endTime > b.startTime
    );
  }
}