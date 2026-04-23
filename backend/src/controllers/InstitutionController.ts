import { NextFunction, Request, Response } from "express";
import { InstitutionService } from "../services/InstitutionService";
import { successResponse } from "../shared/response";
import {
  InstitutionCreateDto,
  InstitutionParamDto,
  InstitutionQueryDto,
  InstitutionUpdateDto,
} from "../validators/institution.validator";

const institutionService = new InstitutionService();

export class InstitutionController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const dto = req.body as InstitutionCreateDto;
      const institution = await institutionService.create(user, dto);

      return successResponse(res, institution, 201);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const query = req.query as unknown as InstitutionQueryDto;
      const result = await institutionService.getAll(user, query);

      return successResponse(res, result.data, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as InstitutionParamDto;
      const institution = await institutionService.getById(user, id);

      return successResponse(res, institution);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as InstitutionParamDto;
      const dto = req.body as InstitutionUpdateDto;
      const institution = await institutionService.update(user, id, dto);

      return successResponse(res, institution);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const { id } = req.params as unknown as InstitutionParamDto;
      const institution = await institutionService.delete(user, id);

      return successResponse(res, institution);
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = String(req.query.query ?? "");
      const institutions = await institutionService.search(query);

      return successResponse(res, institutions);
    } catch (error) {
      next(error);
    }
  }

  async join(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const institutionId = String(req.body.institutionId);
      const result = await institutionService.joinInstitution(user.id, institutionId);

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}
