import { z } from 'zod';

export const chatMessageCreateSchema = z.object({
  sessionId: z.string().trim().min(1, 'sessionId 为必填项').max(100, 'sessionId 过长'),
  content: z.string().trim().min(1, 'content 为必填项').max(4000, '消息长度不能超过 4000 个字符'),
});

export const chatSessionParamsSchema = z.object({
  sessionId: z.string().trim().min(1, 'sessionId 为必填项'),
});

export type ChatMessageCreateInput = z.infer<typeof chatMessageCreateSchema>;
