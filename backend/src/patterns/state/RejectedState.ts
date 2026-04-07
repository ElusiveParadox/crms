import { BookingState } from "./BookingState";
import { DomainError } from "../../shared/DomainError";

export class RejectedState implements BookingState {
  approve(): void {
    throw new DomainError("Cannot approve rejected booking");
  }

  reject(): void {
    throw new DomainError("Already rejected");
  }

  cancel(): void {
    throw new DomainError("Cannot cancel rejected booking");
  }

  getName(): string {
    return "REJECTED";
  }
}