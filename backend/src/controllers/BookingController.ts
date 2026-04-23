import { NextFunction, Request, Response } from "express";
import { BookingService } from "../services/BookingService";
import { successResponse } from "../shared/response";
import {
  BookingCreateDto,
  BookingParamDto,
  BookingQueryDto,
  BookingUpdateDto,
} from "../validators/booking.validator";

const bookingService = new BookingService();

export class BookingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const dto = req.body as BookingCreateDto;
      const booking = await bookingService.create(user, dto);

      return successResponse(res, booking, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const query = req.query as unknown as BookingQueryDto;
      const result = await bookingService.getAll(user, query);

      return successResponse(res, result.data, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as BookingParamDto;
      const booking = await bookingService.getById(user, id);

      return successResponse(res, booking);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as BookingParamDto;
      const dto = req.body as BookingUpdateDto;
      const booking = await bookingService.update(user, id, dto);

      return successResponse(res, booking);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as BookingParamDto;
      const booking = await bookingService.delete(user, id);

      return successResponse(res, booking);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as BookingParamDto;
      const booking = await bookingService.cancel(user, id);

      return successResponse(res, booking);
    } catch (error) {
      next(error);
    }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as BookingParamDto;
      const booking = await bookingService.approve(user, id);

      return successResponse(res, booking);
    } catch (error) {
      next(error);
    }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as BookingParamDto;
      const booking = await bookingService.reject(user, id);

      return successResponse(res, booking);
    } catch (error) {
      next(error);
    }
  }
}
