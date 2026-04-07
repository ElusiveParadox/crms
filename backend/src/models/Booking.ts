import { User } from "./User";
import { Resource } from "./Resource";
import { BookingState } from "../patterns/state/BookingState";
import { PendingState } from "../patterns/state/PendingState";
import { ConflictStrategy } from "../patterns/strategy/ConflictStrategy";
import { BookingSubject } from "../patterns/observer/BookingSubject";
import { DomainError } from "../shared/DomainError";

type BookingProps = {
  id: string;
  user: User;
  resource: Resource;
  startTime: Date;
  endTime: Date;
};

export class Booking {
  private state: BookingState;
  private readonly subject: BookingSubject;

  public readonly id: string;
  public readonly user: User;
  public readonly resource: Resource;
  public readonly startTime: Date;
  public readonly endTime: Date;

  constructor(props: BookingProps) {
    if (props.startTime >= props.endTime) {
      throw new DomainError("Invalid booking time range");
    }
    if (!props.resource.isAvailable()) {
      throw new DomainError("Cannot book inactive resource");
    }
    if (props.startTime <= new Date()) {
        throw new DomainError("Booking must be in the future");
    }
    if (props.user.institutionId !== props.resource.institutionId) {
        throw new DomainError("Cross-institution booking not allowed");
    }

    this.id = props.id;
    this.user = props.user;
    this.resource = props.resource;
    this.startTime = props.startTime;
    this.endTime = props.endTime;

    this.state = new PendingState();
    this.subject = new BookingSubject();
  }

  // ---------------- STATE ----------------

  setState(state: BookingState): void {
    this.state = state;
    this.subject.notify(this);
  }

  approve(actor: User): void {
    if (!actor.canApproveBooking()) {
      throw new DomainError("Not allowed to approve booking", 403);
    }

    this.state.approve(this);
  }

  reject(actor: User): void {
    if (!actor.canApproveBooking()) {
      throw new DomainError("Not allowed to reject booking", 403);
    }

    this.state.reject(this);
  }

  cancel(actor: User): void {
    if (actor.id !== this.user.id && !actor.canApproveBooking()) {
      throw new DomainError("Not allowed to cancel booking", 403);
    }

    this.state.cancel(this);
  }

  getState(): string {
    return this.state.getName();
  }

  // ---------------- STRATEGY ----------------

  validateConflict(
    existingBookings: Booking[],
    strategy: ConflictStrategy,
    actor: User
  ): void {
    const hasConflict = strategy.hasConflict(this, existingBookings);

    if (hasConflict && !actor.canOverrideConflicts()) {
      throw new DomainError("Booking conflict detected", 409);
    }
  }

  // ---------------- OBSERVER ----------------

  attachObserver(observer: any): void {
    this.subject.attach(observer);
  }
}