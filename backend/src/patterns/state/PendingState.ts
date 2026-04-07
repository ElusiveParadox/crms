import { Booking } from "../../models/Booking";
import { BookingState } from "./BookingState";
import { ApprovedState } from "./ApprovedState";
import { RejectedState } from "./RejectedState";
import { CancelledState } from "./CancelledState";

export class PendingState implements BookingState {
  approve(booking: Booking): void {
    booking.setState(new ApprovedState());
  }

  reject(booking: Booking): void {
    booking.setState(new RejectedState());
  }

  cancel(booking: Booking): void {
    booking.setState(new CancelledState());
  }

  getName(): string {
    return "PENDING";
  }
}