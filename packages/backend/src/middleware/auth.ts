import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '@ifly-medical/shared';
import { env } from '../config/env';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ error: '未登录或 token 无效' });
    return;
  }

  const token = authorization.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthUser;
    (req as Request & { user?: AuthUser }).user = {
      userId: payload.userId,
      username: payload.username,
    };
    next();
  } catch {
    res.status(401).json({ error: '未登录或 token 无效' });
  }
}
