import type { ErrorRequestHandler } from 'express';
import { AppError, isAppError } from '../lib/app-error';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (isAppError(error)) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  console.error(error);

  const fallback = new AppError(500, 'INTERNAL_SERVER_ERROR', '服务器内部错误');
  res.status(fallback.statusCode).json({
    error: fallback.message,
    code: fallback.code,
  });
};
