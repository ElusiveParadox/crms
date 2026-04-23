import { Request, Response, NextFunction } from "express";
import { BookingService } from "../services/BookingService";
import { successResponse } from "../shared/response";

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management APIs
 */
export class BookingController {
  private service: BookingService;

  constructor(service: BookingService) {
    this.service = service;
  }

  /**
   * @swagger
   * /bookings:
   *   post:
   *     summary: Create booking
   *     tags: [Bookings]
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;

      const booking = await this.service.create(user, {
        resourceId: req.body.resourceId,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
      });

      return successResponse(res, booking, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /bookings/me:
   *   get:
   *     summary: Get my bookings
   *     tags: [Bookings]
   */
  async myBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;

      const data = await this.service.getMyBookings(user);

      return successResponse(res, data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /bookings/{id}/cancel:
   *   post:
   *     summary: Cancel booking
   *     tags: [Bookings]
   */
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const bookingId = req.params.id;

      const result = await this.service.cancel(user, bookingId as string);

      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /bookings/{id}/approve:
   *   post:
   *     summary: Approve booking (Admin only)
   *     tags: [Bookings]
   */
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const bookingId = req.params.id;

      const result = await this.service.approve(user, bookingId as string);

      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /bookings/{id}/reject:
   *   post:
   *     summary: Reject booking (Admin only)
   *     tags: [Bookings]
   */
  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const bookingId = req.params.id;

      const result = await this.service.reject(user, bookingId as string);

      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  }
}