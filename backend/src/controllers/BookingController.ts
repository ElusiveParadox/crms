import { Request, Response, NextFunction } from "express";
import { BookingService } from "../services/BookingService";

const service = new BookingService();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management APIs
 */

export class BookingController {

  /**
   * @swagger
   * /bookings:
   *   post:
   *     summary: Create booking
   *     tags: [Bookings]
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const booking = await service.create(user, req.body);
      res.status(201).json(booking);
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
      const user = (req as any).user;
      const data = await service.getMyBookings(user);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /bookings/all:
   *   get:
   *     summary: Get all bookings (Admin)
   *     tags: [Bookings]
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const data = await service.getAllBookings(user);
      res.json(data);
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
      const user = (req as any).user;
      const result = await service.cancel(user, req.params.id as string);
      res.json(result);
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
      const user = (req as any).user;
      const result = await service.approve(user, req.params.id as string);
      res.json(result);
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
      const user = (req as any).user;
      const result = await service.reject(user, req.params.id as string);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}