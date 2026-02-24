import type { Response } from "express";

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  success = true
) => {
  return res.status(statusCode).json({
    statusCode,
    message,
    success,
    data,
  });
};