import { Request, Response, NextFunction } from "express";
import { createResource, listResources } from "../services/ResourceService";

export class ResourceController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const resource = await createResource(user, req.body);
      res.status(201).json(resource);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const resources = await listResources(user.institutionId);
      res.json(resources);
    } catch (err) {
      next(err);
    }
  }
}
