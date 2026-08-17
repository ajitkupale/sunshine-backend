import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (env.NODE_ENV === "development") {
    console.error("💥 Error:", err);
    res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
    return;
  }

  // In production, don't leak stack traces
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : message,
  });
}

export function createError(message: string, statusCode: number): AppError {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(createError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}
