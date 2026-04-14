import { AppError } from '../lib/app-error';

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new AppError(500, `MISSING_${name}`, `${name} 未配置`);
  }
  return value;
}

export const env = {
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  aiApiKey: process.env.AI_API_KEY ?? null,
  aiModel: process.env.AI_MODEL || 'qwen-plus',
  allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  port: Number(process.env.PORT ?? '3001'),
};
