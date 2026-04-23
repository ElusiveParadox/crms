import { NextFunction, Request, Response } from "express";
import { ResourceService } from "../services/ResourceService";
import { successResponse } from "../shared/response";
import {
  ResourceCreateDto,
  ResourceParamDto,
  ResourceQueryDto,
  ResourceUpdateDto,
} from "../validators/resource.validator";

const resourceService = new ResourceService();

export class ResourceController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const dto = req.body as ResourceCreateDto;
      const resource = await resourceService.create(user, dto);

      return successResponse(res, resource, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const query = req.query as unknown as ResourceQueryDto;
      const result = await resourceService.getAll(user, query);

      return successResponse(res, result.data, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as ResourceParamDto;
      const resource = await resourceService.getById(user, id);

      return successResponse(res, resource);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as ResourceParamDto;
      const dto = req.body as ResourceUpdateDto;
      const resource = await resourceService.update(user, id, dto);

      return successResponse(res, resource);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as ResourceParamDto;
      const resource = await resourceService.delete(user, id);

      return successResponse(res, resource);
    } catch (error) {
      next(error);
    }
  }
}
