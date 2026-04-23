import { prisma } from "../config/db";
import { Booking } from "../models/Booking";
import { UserFactory } from "../patterns/factory/UserFactory";
import { UserRole } from "../models/User";
import { Resource } from "../models/Resource";
import { StrictConflictStrategy } from "../patterns/strategy/StrictConflictStrategy";
import { NotificationObserver } from "../patterns/observer/NotificationObserver";
import { DomainError } from "../shared/DomainError";
import { eventBus } from "../events/EventBus";
import { EventType } from "../events/EventTypes";
import crypto from "crypto";

export class BookingService {

  // -------------------------------
  // CREATE BOOKING
  // -------------------------------
  async create(user: any, data: any) {
    const { resourceId, startTime, endTime } = data;

    if (!resourceId || !startTime || !endTime) {
      throw new DomainError("Missing booking data");
    }

    if (new Date(startTime) >= new Date(endTime)) {
      throw new DomainError("Invalid time range");
    }

    if (new Date(startTime) <= new Date()) {
      throw new DomainError("Booking must be in the future");
    }

    if (!user.institutionId) {
      throw new DomainError("User must belong to an institution");
    }

    const domainUser = UserFactory.create(user as any);

    if (!domainUser.canCreateBooking()) {
      throw new DomainError("Permission denied");
    }

    const resourceRaw = await prisma.resource.findUnique({
      where: { id: resourceId }
    });

    if (!resourceRaw || resourceRaw.deletedAt || !resourceRaw.isActive) {
      throw new DomainError("Resource not available");
    }

    if (resourceRaw.institutionId !== user.institutionId) {
      throw new DomainError("Cross-institution booking not allowed");
    }

    const resource = new Resource(resourceRaw);

    const conflicting = await prisma.booking.findFirst({
      where: {
        resourceId,
        status: { in: ["PENDING", "APPROVED"] },
        OR: [
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gt: new Date(startTime) }
          }
        ]
      }
    });

    if (conflicting) {
      throw new DomainError("Slot already occupied", 409);
    }

    const booking = new Booking({
      id: crypto.randomUUID(),
      user: domainUser,
      resource,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    const observer = new NotificationObserver();
    booking.attachObserver(observer);

    booking.validateConflict([], new StrictConflictStrategy(), domainUser);

    const saved = await prisma.booking.create({
      data: {
        id: booking.id,
        userId: domainUser.id,
        resourceId: resource.id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: "PENDING"
      },
      include: {
        user: true,
        resource: true
      }
    });

    await eventBus.publish({
      type: EventType.BOOKING_CREATED,
      payload: {
        bookingId: saved.id,
        userId: saved.userId,
        resourceId: saved.resourceId
      },
      timestamp: new Date()
    });

    return saved;
  }

  // -------------------------------
  // MY BOOKINGS
  // -------------------------------
  async getMyBookings(user: any) {
    if (!user.id) {
      throw new DomainError("Invalid user");
    }

    return prisma.booking.findMany({
      where: { userId: user.id },
      include: { resource: true },
      orderBy: { startTime: "asc" }
    });
  }

  // -------------------------------
  // CANCEL
  // -------------------------------
  async cancel(user: any, bookingId: string) {
    const bookingRaw = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { resource: true, user: true }
    });

    if (!bookingRaw) {
      throw new DomainError("Booking not found");
    }

    if (bookingRaw.userId !== user.id) {
      throw new DomainError("Unauthorized");
    }

    const actor = UserFactory.create(user as any);
    const resource = new Resource(bookingRaw.resource);

    const booking = new Booking({
      id: bookingRaw.id,
      user: actor,
      resource,
      startTime: bookingRaw.startTime,
      endTime: bookingRaw.endTime,
    });

    booking.attachObserver(new NotificationObserver());
    booking.cancel(actor);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    await eventBus.publish({
      type: EventType.BOOKING_CANCELLED,
      payload: { bookingId },
      timestamp: new Date()
    });

    return updated;
  }

  // -------------------------------
  // APPROVE
  // -------------------------------
  async approve(user: any, bookingId: string) {
    const bookingRaw = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, resource: true }
    });

    if (!bookingRaw) {
      throw new DomainError("Booking not found");
    }

    const actor = UserFactory.create(user as any);
    const bookingUser = UserFactory.create({
      ...bookingRaw.user,
      role: bookingRaw.user.role as unknown as UserRole
    });
    const resource = new Resource(bookingRaw.resource);

    if (!actor.canApproveBooking()) {
      throw new DomainError("Permission denied");
    }

    const booking = new Booking({
      id: bookingRaw.id,
      user: bookingUser,
      resource,
      startTime: bookingRaw.startTime,
      endTime: bookingRaw.endTime,
    });

    booking.attachObserver(new NotificationObserver());
    booking.approve(actor);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "APPROVED" }
    });

    await eventBus.publish({
      type: EventType.BOOKING_APPROVED,
      payload: { bookingId },
      timestamp: new Date()
    });

    return updated;
  }

  // -------------------------------
  // REJECT
  // -------------------------------
  async reject(user: any, bookingId: string) {
    const bookingRaw = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, resource: true }
    });

    if (!bookingRaw) {
      throw new DomainError("Booking not found");
    }

    const actor = UserFactory.create(user as any);
    const bookingUser = UserFactory.create({
      ...bookingRaw.user,
      role: bookingRaw.user.role as unknown as UserRole
    });
    const resource = new Resource(bookingRaw.resource);

    if (!actor.canApproveBooking()) {
      throw new DomainError("Permission denied");
    }

    const booking = new Booking({
      id: bookingRaw.id,
      user: bookingUser,
      resource,
      startTime: bookingRaw.startTime,
      endTime: bookingRaw.endTime,
    });

    booking.attachObserver(new NotificationObserver());
    booking.reject(actor);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "REJECTED" }
    });

    await eventBus.publish({
      type: EventType.BOOKING_REJECTED,
      payload: { bookingId },
      timestamp: new Date()
    });

    return updated;
  }
}