import { BookingStatus, Prisma } from "@prisma/client";
import crypto from "crypto";
import { prisma } from "../config/db";
import { eventBus } from "../events/EventBus";
import { EventType } from "../events/EventTypes";
import { Booking } from "../models/Booking";
import { Resource } from "../models/Resource";
import { User, UserRole } from "../models/User";
import { UserFactory } from "../patterns/factory/UserFactory";
import { NotificationObserver } from "../patterns/observer/NotificationObserver";
import { StrictConflictStrategy } from "../patterns/strategy/StrictConflictStrategy";
import { DomainError } from "../shared/DomainError";
import { buildPagination, PaginatedResult } from "../shared/query";
import {
  BookingCreateDto,
  BookingQueryDto,
  BookingUpdateDto,
} from "../validators/booking.validator";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.APPROVED,
];

const bookingInclude = {
  user: {
    select: {
      id: true,
      email: true,
      role: true,
      institutionId: true,
    },
  },
  resource: true,
} satisfies Prisma.BookingInclude;

type BookingRecord = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

export class BookingService {
  async create(actor: User, dto: BookingCreateDto): Promise<BookingRecord> {
    this.ensureInstitutionScoped(actor);

    const bookingUserId =
      actor.canApproveBooking() && dto.userId ? dto.userId : actor.id;
    const bookingUser = await this.getBookingUser(actor, bookingUserId);
    const resource = await this.getActiveResource(actor, dto.resourceId);

    this.validateBookingRange(dto.startTime, dto.endTime);
    await this.ensureBookingConflict(resource.id, dto.startTime, dto.endTime);

    const domainUser = UserFactory.create({
      id: bookingUser.id,
      email: bookingUser.email,
      role: bookingUser.role as unknown as UserRole,
      institutionId: bookingUser.institutionId,
    });

    if (!domainUser.canCreateBooking()) {
      throw new DomainError("Forbidden", 403);
    }

    const booking = new Booking({
      id: crypto.randomUUID(),
      user: domainUser,
      resource: new Resource(resource),
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    booking.attachObserver(new NotificationObserver());
    booking.validateConflict([], new StrictConflictStrategy(), domainUser);

    const createdBooking = await prisma.booking.create({
      data: {
        id: booking.id,
        userId: bookingUser.id,
        resourceId: resource.id,
        startTime: dto.startTime,
        endTime: dto.endTime,
        status: dto.status ?? BookingStatus.PENDING,
      },
      include: bookingInclude,
    });

    await eventBus.publish({
      type: EventType.BOOKING_CREATED,
      payload: {
        bookingId: createdBooking.id,
        userId: createdBooking.userId,
        resourceId: createdBooking.resourceId,
      },
      timestamp: new Date(),
    });

    return createdBooking;
  }

  async update(actor: User, id: string, dto: BookingUpdateDto): Promise<BookingRecord> {
    this.ensureInstitutionScoped(actor);

    const existingBooking = await this.getBookingRecord(actor, id);
    this.ensureBookingAccess(actor, existingBooking.userId);

    const nextResourceId = dto.resourceId ?? existingBooking.resourceId;
    const nextUserId =
      actor.canApproveBooking() && dto.userId ? dto.userId : existingBooking.userId;
    const nextStartTime = dto.startTime ?? existingBooking.startTime;
    const nextEndTime = dto.endTime ?? existingBooking.endTime;

    this.validateBookingRange(nextStartTime, nextEndTime);
    await this.getActiveResource(actor, nextResourceId);
    await this.getBookingUser(actor, nextUserId);
    await this.ensureBookingConflict(nextResourceId, nextStartTime, nextEndTime, id);

    return prisma.booking.update({
      where: { id },
      data: {
        resourceId: nextResourceId,
        userId: nextUserId,
        startTime: nextStartTime,
        endTime: nextEndTime,
        ...(dto.status ? { status: dto.status } : {}),
      },
      include: bookingInclude,
    });
  }

  async delete(actor: User, id: string): Promise<BookingRecord> {
    this.ensureInstitutionScoped(actor);

    const existingBooking = await this.getBookingRecord(actor, id);
    this.ensureBookingAccess(actor, existingBooking.userId);

    return prisma.booking.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: bookingInclude,
    });
  }

  async getById(actor: User, id: string): Promise<BookingRecord> {
    this.ensureInstitutionScoped(actor);

    const booking = await this.getBookingRecord(actor, id);
    this.ensureBookingAccess(actor, booking.userId);

    return booking;
  }

  async getAll(
    actor: User,
    query: BookingQueryDto
  ): Promise<PaginatedResult<BookingRecord>> {
    this.ensureInstitutionScoped(actor);

    const { page, limit, skip } = buildPagination(query);

    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      resource: {
        institutionId: actor.institutionId,
        deletedAt: null,
      },
      user: {
        institutionId: actor.institutionId,
        deletedAt: null,
      },
      ...(actor.canApproveBooking() ? {} : { userId: actor.id }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.resourceId ? { resourceId: query.resourceId } : {}),
      ...(query.userId && actor.canApproveBooking() ? { userId: query.userId } : {}),
      ...(query.startDate || query.endDate
        ? {
            startTime: {
              ...(query.startDate ? { gte: query.startDate } : {}),
              ...(query.endDate ? { lte: query.endDate } : {}),
            },
          }
        : {}),
    };

    const [bookings, total] = await prisma.$transaction([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sort]: query.order,
        },
        include: bookingInclude,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: { page, limit, total },
    };
  }

  async getMyBookings(actor: User) {
    return this.getAll(actor, {
      page: 1,
      limit: 10,
      sort: "startTime",
      order: "asc",
    });
  }

  async cancel(actor: User, bookingId: string): Promise<BookingRecord> {
    this.ensureInstitutionScoped(actor);

    const bookingRecord = await this.getBookingRecord(actor, bookingId);
    this.ensureBookingAccess(actor, bookingRecord.userId);

    const booking = this.createDomainBooking(bookingRecord);
    booking.attachObserver(new NotificationObserver());
    booking.cancel(actor);

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
      include: bookingInclude,
    });

    await eventBus.publish({
      type: EventType.BOOKING_CANCELLED,
      payload: { bookingId },
      timestamp: new Date(),
    });

    return updatedBooking;
  }

  async approve(actor: User, bookingId: string): Promise<BookingRecord> {
    this.ensureInstitutionScoped(actor);

    if (!actor.canApproveBooking()) {
      throw new DomainError("Forbidden", 403);
    }

    const bookingRecord = await this.getBookingRecord(actor, bookingId);
    const booking = this.createDomainBooking(bookingRecord);
    booking.attachObserver(new NotificationObserver());
    booking.approve(actor);

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.APPROVED },
      include: bookingInclude,
    });

    await eventBus.publish({
      type: EventType.BOOKING_APPROVED,
      payload: { bookingId },
      timestamp: new Date(),
    });

    return updatedBooking;
  }

  async reject(actor: User, bookingId: string): Promise<BookingRecord> {
    this.ensureInstitutionScoped(actor);

    if (!actor.canApproveBooking()) {
      throw new DomainError("Forbidden", 403);
    }

    const bookingRecord = await this.getBookingRecord(actor, bookingId);
    const booking = this.createDomainBooking(bookingRecord);
    booking.attachObserver(new NotificationObserver());
    booking.reject(actor);

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.REJECTED },
      include: bookingInclude,
    });

    await eventBus.publish({
      type: EventType.BOOKING_REJECTED,
      payload: { bookingId },
      timestamp: new Date(),
    });

    return updatedBooking;
  }

  private ensureInstitutionScoped(actor: User): asserts actor is User & {
    institutionId: string;
  } {
    if (!actor.institutionId) {
      throw new DomainError("Institution context is required", 400);
    }
  }

  private validateBookingRange(startTime: Date, endTime: Date) {
    if (startTime >= endTime) {
      throw new DomainError("Invalid booking time range", 400);
    }

    if (startTime <= new Date()) {
      throw new DomainError("Booking must be in the future", 400);
    }
  }

  private async getActiveResource(actor: User, resourceId: string) {
    const resource = await prisma.resource.findFirst({
      where: {
        id: resourceId,
        institutionId: actor.institutionId,
        deletedAt: null,
        isActive: true,
      },
    });

    if (!resource) {
      throw new DomainError("Resource not found", 404);
    }

    return resource;
  }

  private async getBookingUser(actor: User, userId: string) {
    const bookingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        institutionId: actor.institutionId,
        deletedAt: null,
      },
    });

    if (!bookingUser) {
      throw new DomainError("User not found", 404);
    }

    return bookingUser;
  }

  private async ensureBookingConflict(
    resourceId: string,
    startTime: Date,
    endTime: Date,
    bookingIdToExclude?: string
  ) {
    const conflict = await prisma.booking.findFirst({
      where: {
        resourceId,
        deletedAt: null,
        status: { in: ACTIVE_BOOKING_STATUSES },
        ...(bookingIdToExclude ? { id: { not: bookingIdToExclude } } : {}),
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (conflict) {
      throw new DomainError("Slot already occupied", 409);
    }
  }

  private async getBookingRecord(actor: User, bookingId: string): Promise<BookingRecord> {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        deletedAt: null,
        resource: {
          institutionId: actor.institutionId,
          deletedAt: null,
        },
        user: {
          institutionId: actor.institutionId,
          deletedAt: null,
        },
      },
      include: bookingInclude,
    });

    if (!booking) {
      throw new DomainError("Booking not found", 404);
    }

    return booking;
  }

  private ensureBookingAccess(actor: User, bookingUserId: string) {
    if (actor.id !== bookingUserId && !actor.canApproveBooking()) {
      throw new DomainError("Forbidden", 403);
    }
  }

  private createDomainBooking(bookingRecord: BookingRecord) {
    const bookingUser = UserFactory.create({
      id: bookingRecord.user.id,
      email: bookingRecord.user.email,
      role: bookingRecord.user.role as unknown as UserRole,
      institutionId: bookingRecord.user.institutionId,
    });

    return new Booking({
      id: bookingRecord.id,
      user: bookingUser,
      resource: new Resource(bookingRecord.resource),
      startTime: bookingRecord.startTime,
      endTime: bookingRecord.endTime,
    });
  }
}
