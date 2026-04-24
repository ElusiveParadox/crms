import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { DomainError } from "../shared/DomainError";

export async function institutionGuard(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;

    if (!user.institutionId) {
      throw new DomainError("User does not belong to any institution", 403);
    }

    const inst = await prisma.institution.findUnique({
      where: { id: user.institutionId }
    });

    if (!inst || inst.deletedAt) {
      throw new DomainError("Institution is inactive");
    }

    next();
  } catch (err) {
    next(err);
  }
}