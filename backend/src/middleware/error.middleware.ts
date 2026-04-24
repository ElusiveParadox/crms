import { Request, Response, NextFunction } from "express";
import { DomainError } from "../shared/DomainError";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof DomainError || (err as any).name === "DomainError") {
    res.status((err as DomainError).statusCode || 400).json({
      success: false,
      error: {
        message: (err as Error).message,
      },
    });
    return;
  }

  console.error("UNHANDLED_ERROR", err);

  res.status(500).json({
    success: false,
    error: {
      message: "Internal Server Error",
    },
  });
};