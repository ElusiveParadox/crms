import { Request, Response, NextFunction } from "express";
import { DomainError } from "../shared/DomainError";
import { User } from "../models/User";

type PermissionCheck = (user: User) => boolean;

export const requirePermission =
  (check: PermissionCheck) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        throw new DomainError("Unauthorized", 401);
      }

      const allowed = check(user);

      if (!allowed) {
        throw new DomainError("Forbidden", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };