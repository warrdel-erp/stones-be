import { Request, Response, NextFunction } from "express";
import { AppError } from "../helper/appError";

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    errors: err.errors || null, // Ensures errorObj is explicitly null if not provided
  });
}
