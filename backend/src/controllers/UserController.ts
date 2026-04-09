import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { UserMapper } from "../mappers/UserMapper";

const userService = new UserService();

export class UserController {
  async getInstitutionUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { institutionId } = (req as any).user;
      const users = await userService.getUsersByInstitution(institutionId);
      
      const dtos = users.map(u => {
        const domain = UserMapper.toDomain(u as any);
        return UserMapper.toDTO(domain);
      });

      res.json(dtos);
    } catch (err) {
      next(err);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = (req as any).user;
      const { userId } = req.params;
      const { role } = req.body;

      const updated = await userService.updateRole(actor, userId as string, role);
      const domain = UserMapper.toDomain(updated as any);

      res.json(UserMapper.toDTO(domain));
    } catch (err) {
      next(err);
    }
  }

  async softDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const actor = (req as any).user;
      const { userId } = req.params;

      await userService.softDelete(actor, userId as string);
      res.json({ message: "User deactivated successfully" });
    } catch (err) {
      next(err);
    }
  }
}
