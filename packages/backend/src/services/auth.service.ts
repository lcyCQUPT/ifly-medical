import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthResponse, AuthUser } from '@ifly-medical/shared';
import prisma from '../lib/prisma';
import { AppError } from '../lib/app-error';
import { env } from '../config/env';

const JWT_EXPIRES_IN = '7d';

function signToken(user: AuthUser) {
  return jwt.sign(user, env.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
}

function buildAuthResponse(user: AuthUser): AuthResponse {
  return {
    token: signToken(user),
    user,
  };
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const normalizedUsername = username.trim();
  const existing = await prisma.user.findUnique({ where: { username: normalizedUsername } });
  if (existing) {
    throw new AppError(409, 'USERNAME_EXISTS', '用户名已存在');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userRecord = await prisma.user.create({
    data: {
      username: normalizedUsername,
      passwordHash,
    },
  });

  return buildAuthResponse({ userId: userRecord.id, username: userRecord.username });
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const normalizedUsername = username.trim();
  const userRecord = await prisma.user.findUnique({ where: { username: normalizedUsername } });
  if (!userRecord) {
    throw new AppError(401, 'INVALID_CREDENTIALS', '用户名或密码错误');
  }

  const passwordMatched = await bcrypt.compare(password, userRecord.passwordHash);
  if (!passwordMatched) {
    throw new AppError(401, 'INVALID_CREDENTIALS', '用户名或密码错误');
  }

  return buildAuthResponse({ userId: userRecord.id, username: userRecord.username });
}

export async function getUserById(userId: number): Promise<AuthUser> {
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true },
  });

  if (!userRecord) {
    throw new AppError(401, 'USER_NOT_FOUND', '用户不存在');
  }

  return {
    userId: userRecord.id,
    username: userRecord.username,
  };
}
