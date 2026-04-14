import type { Request } from 'express';
import type { AuthUser } from '@ifly-medical/shared';
import { AppError } from '../lib/app-error';

export function getRequestUser(req: Request): AuthUser {
  const user = (req as Request & { user?: AuthUser }).user;
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', '未登录或 token 无效');
  }
  return user;
}
