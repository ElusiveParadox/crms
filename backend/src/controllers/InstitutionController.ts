import { Request, Response, NextFunction } from "express";
import { InstitutionService } from "../services/InstitutionService";

const service = new InstitutionService();

export class InstitutionController {
  
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.query as string;
      const result = await service.search(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = (req as any).user;

      const institution = await service.create(name, user.id);

      res.status(201).json(institution);
    } catch (err) {
      next(err);
    }
  }

  async join(req: Request, res: Response, next: NextFunction) {
    try {
      const { institutionId } = req.body;
      const user = (req as any).user;

      const result = await service.joinInstitution(user.id, institutionId);

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}