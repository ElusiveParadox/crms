import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { successResponse } from "../shared/response";
import {
  UserCreateDto,
  UserParamDto,
  UserQueryDto,
  UserUpdateDto,
} from "../validators/user.validator";

const userService = new UserService();

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const dto = req.body as UserCreateDto;
      const createdUser = await userService.create(user, dto);

      return successResponse(res, createdUser, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const query = req.query as unknown as UserQueryDto;
      const result = await userService.getAll(user, query);

      return successResponse(res, result.data, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as UserParamDto;
      const userRecord = await userService.getById(user, id);

      return successResponse(res, userRecord);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as UserParamDto;
      const dto = req.body as UserUpdateDto;
      const updatedUser = await userService.update(user, id, dto);

      return successResponse(res, updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as UserParamDto;
      const deletedUser = await userService.delete(user, id);

      return successResponse(res, deletedUser);
    } catch (error) {
      next(error);
    }
  }
}
