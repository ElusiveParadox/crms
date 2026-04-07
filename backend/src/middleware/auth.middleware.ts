import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { DomainError } from "../shared/DomainError";
import { UserMapper } from "../mappers/UserMapper";
import { User } from "../models/User";
import { isTokenPayload } from "../shared/typeGuards";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new DomainError("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new DomainError("Unauthorized", 401);
    }

    let decoded: unknown;

    try {
      decoded = jwt.verify(token, env.JWT_SECRET as string);
    } catch {
      throw new DomainError("Unauthorized", 401);
    }

    if (!isTokenPayload(decoded)) {
      throw new DomainError("Unauthorized", 401);
    }

    const payload = decoded as TokenPayload;

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!dbUser) {
      throw new DomainError("Unauthorized", 401);
    }

    req.user = UserMapper.toDomain(dbUser);

    next();
  } catch (error) {
    next(error);
  }
};