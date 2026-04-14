import type { RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../lib/app-error';

interface ValidateSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

interface ValidatedPayload {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

export function getValidated<T>(res: Response, key: keyof ValidatedPayload): T {
  return res.locals.validated?.[key] as T;
}

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

export function validateRequest(schemas: ValidateSchemas): RequestHandler {
  return (req, res, next) => {
    try {
      const validated: ValidatedPayload = {};

      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body);
        req.body = parsedBody;
        validated.body = parsedBody;
      }
      if (schemas.query) {
        validated.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        validated.params = schemas.params.parse(req.params);
      }

      res.locals.validated = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(400, 'VALIDATION_ERROR', '请求参数校验失败', formatZodError(error)));
        return;
      }
      next(error);
    }
  };
}
