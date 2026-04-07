import { BookingState } from "./BookingState";
import { DomainError } from "../../shared/DomainError";

export class CancelledState implements BookingState {
  approve(): void {
    throw new DomainError("Cannot approve cancelled booking");
  }

  reject(): void {
    throw new DomainError("Cannot reject cancelled booking");
  }

  cancel(): void {
    throw new DomainError("Already cancelled");
  }

  getName(): string {
    return "CANCELLED";
  }
}