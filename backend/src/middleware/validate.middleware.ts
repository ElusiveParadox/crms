import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { DomainError } from "../shared/DomainError";

export const validate =
  (schema: ZodSchema, source: "body" | "params" | "query" = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        throw new DomainError("Validation failed", 400);
      }

      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
      next();
    } catch (err) {
      next(err);
    }
  };

 