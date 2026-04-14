import { z } from 'zod';

export const authCredentialsSchema = z.object({
  username: z.string().trim().min(3, '用户名至少 3 个字符').max(32, '用户名不能超过 32 个字符'),
  password: z.string().min(6, '密码至少 6 个字符').max(128, '密码不能超过 128 个字符'),
});

export type AuthCredentialsInput = z.infer<typeof authCredentialsSchema>;
