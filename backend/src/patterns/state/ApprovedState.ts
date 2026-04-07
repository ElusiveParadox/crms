import { Booking } from "../../models/Booking";
import { BookingState } from "./BookingState";
import { DomainError } from "../../shared/DomainError";
import { CancelledState } from "./CancelledState";

export class ApprovedState implements BookingState {
  approve(): void {
    throw new DomainError("Already approved");
  }

  reject(): void {
    throw new DomainError("Cannot reject approved booking");
  }

  cancel(booking: Booking): void {
    booking.setState(new CancelledState());
  }

  getName(): string {
    return "APPROVED";
  }
}