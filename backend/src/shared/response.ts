import { Response } from "express";

type SuccessMeta = Record<string, unknown>;

export const successResponse = (
  res: Response,
  data: unknown,
  statusCode = 200,
  meta: SuccessMeta = {}
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta,
  });
};
