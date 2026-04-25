import { prisma } from "../config/db";
import { Booking } from "../models/Booking";
import { UserFactory } from "../patterns/factory/UserFactory";
import { Resource } from "../models/Resource";
import { StrictConflictStrategy } from "../patterns/strategy/StrictConflictStrategy";
import { NotificationObserver } from "../patterns/observer/NotificationObserver";
import { DomainError } from "../shared/DomainError";
import crypto from "crypto";

export class BookingService {

  // CREATE BOOKING
  async create(user: any, data: any) {
    const { resourceId, startTime, endTime } = data;

    const resourceRaw = await prisma.resource.findUnique({
      where: { id: resourceId }
    });

    if (!resourceRaw || resourceRaw.deletedAt || !resourceRaw.isActive) {
      throw new DomainError("Resource not available");
    }

    const resource = new Resource({
      id: resourceRaw.id,
      name: resourceRaw.name,
      type: resourceRaw.type,
      capacity: resourceRaw.capacity,
      institutionId: resourceRaw.institutionId ?? "",
      isActive: resourceRaw.isActive,
    });
    const domainUser = UserFactory.create(user as any);

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

    // Domain Booking
    const booking = new Booking({
      id: crypto.randomUUID(),
      user: domainUser,
      resource,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    // Attach Observer
    const observer = new NotificationObserver();
    booking.attachObserver(observer);

    // Strategy Validation
    booking.validateConflict(
      [], 
      new StrictConflictStrategy(),
      domainUser
    );

    // Persist
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

    return saved;
  }

  // MY BOOKINGS
  async getMyBookings(user: any) {
    return prisma.booking.findMany({
      where: { userId: user.id },
      include: { resource: true },
      orderBy: { startTime: "asc" }
    });
  }

  // ALL BOOKINGS (Admin)
  async getAllBookings(user: any) {
    return prisma.booking.findMany({
      include: { resource: true, user: true },
      orderBy: { startTime: "desc" }
    });
  }

  // CANCEL
  async cancel(user: any, bookingId: string) {
    const bookingRaw = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { resource: true }
    });

    if (!bookingRaw) {
      throw new DomainError("Booking not found");
    }

    const domainUser = UserFactory.create(user as any);
    const resource = new Resource({
      id: bookingRaw.resource.id,
      name: bookingRaw.resource.name,
      type: bookingRaw.resource.type,
      capacity: bookingRaw.resource.capacity,
      institutionId: bookingRaw.resource.institutionId ?? "",
      isActive: bookingRaw.resource.isActive,
    });

    const booking = new Booking({
      id: bookingRaw.id,
      user: domainUser,
      resource,
      startTime: bookingRaw.startTime,
      endTime: bookingRaw.endTime,
    });

    booking.attachObserver(new NotificationObserver());
    booking.cancel(domainUser);

    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });
  }

  // APPROVE
  async approve(user: any, bookingId: string) {
    const bookingRaw = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, resource: true }
    });

    if (!bookingRaw) {
      throw new DomainError("Booking not found");
    }

    const actor = UserFactory.create(user as any);
    const bookingUser = UserFactory.create(bookingRaw.user as any);
    const resource = new Resource({
      id: bookingRaw.resource.id,
      name: bookingRaw.resource.name,
      type: bookingRaw.resource.type,
      capacity: bookingRaw.resource.capacity,
      institutionId: bookingRaw.resource.institutionId ?? "",
      isActive: bookingRaw.resource.isActive,
    });

    const booking = new Booking({
      id: bookingRaw.id,
      user: bookingUser,
      resource,
      startTime: bookingRaw.startTime,
      endTime: bookingRaw.endTime,
    });

    booking.attachObserver(new NotificationObserver());
    booking.approve(actor);

    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: "APPROVED" }
    });
  }

  // REJECT
  async reject(user: any, bookingId: string) {
    const bookingRaw = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, resource: true }
    });

    if (!bookingRaw) {
      throw new DomainError("Booking not found");
    }

    const actor = UserFactory.create(user as any);
    const bookingUser = UserFactory.create(bookingRaw.user as any);
    const resource = new Resource({
      id: bookingRaw.resource.id,
      name: bookingRaw.resource.name,
      type: bookingRaw.resource.type,
      capacity: bookingRaw.resource.capacity,
      institutionId: bookingRaw.resource.institutionId ?? "",
      isActive: bookingRaw.resource.isActive,
    });

    const booking = new Booking({
      id: bookingRaw.id,
      user: bookingUser,
      resource,
      startTime: bookingRaw.startTime,
      endTime: bookingRaw.endTime,
    });

    booking.attachObserver(new NotificationObserver());
    booking.reject(actor);

    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: "REJECTED" }
    });
  }
}