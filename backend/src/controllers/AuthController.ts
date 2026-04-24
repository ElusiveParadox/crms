import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/UserService";
import { UserMapper } from "../mappers/UserMapper";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

const userService = new UserService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.register(req.body);
      const domainUser = UserMapper.toDomain(user as any);
      res.status(201).json({
        message: "User registered successfully",
        user: UserMapper.toDTO(domainUser),
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await userService.login(email, password);
      
      const domainUser = UserMapper.toDomain(user as any);
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role, 
          institutionId: user.institutionId 
        },
        env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        token,
        user: UserMapper.toDTO(domainUser),
      });
    } catch (err) {
      next(err);
    }
  }
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      res.json({
        success: true,
        data: UserMapper.toDTO(user),
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, message: "Logged out" });
    } catch (err) {
      next(err);
    }
  }
}
