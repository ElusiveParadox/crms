import { Request, Response, NextFunction } from "express";
import { DomainError } from "../shared/DomainError";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
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