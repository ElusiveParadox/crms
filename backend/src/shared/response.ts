export const successResponse = (
  res: any,
  data: unknown,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const errorResponse = (
  res: any,
  message: string,
  statusCode = 400
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};