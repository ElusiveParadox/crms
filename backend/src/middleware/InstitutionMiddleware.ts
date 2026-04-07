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