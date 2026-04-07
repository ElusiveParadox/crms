import { prisma } from "../config/db";
import { Booking } from "../models/Booking";
import { User } from "../models/User";
import { Resource } from "../models/Resource";
import { StrictConflictStrategy } from "../patterns/strategy/StrictConflictStrategy";
import { NotificationObserver } from "../patterns/observer/NotificationObserver";
import { DomainError } from "../shared/DomainError";

export class BookingService {
  async createBooking(
    user: User,
    resource: Resource,
    startTime: Date,
    endTime: Date
  ): Promise<Booking> {
    if (!user.canCreateBooking()) {
      throw new DomainError("Not allowed to create booking", 403);
    }

    const existing = await prisma.booking.findMany({
      where: { resourceId: resource.id },
    });

    const booking = new Booking({
      id: crypto.randomUUID(),
      user,
      resource,
      startTime,
      endTime,
    });

    booking.attachObserver(new NotificationObserver());

    booking.validateConflict(
      [],
      new StrictConflictStrategy(),
      user
    );

    return booking;
  }
}