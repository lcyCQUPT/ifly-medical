import OpenAI from 'openai';
import type { ChatMessage, ChatSession } from '@ifly-medical/shared';
import prisma from '../lib/prisma';
import { env } from '../config/env';
import { AppError } from '../lib/app-error';

const openai = new OpenAI({
  apiKey: env.aiApiKey ?? undefined,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

const SYSTEM_PROMPT =
  '你是专业的健康助手，根据用户信息给出健康建议，仅供参考，不构成医疗诊断。';
const MAX_HISTORY_MESSAGES = 20;

export async function getSessions(userId: number): Promise<ChatSession[]> {
  const all = await prisma.chatHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  const seen = new Set<string>();
  const sessions: ChatSession[] = [];
  for (const msg of all) {
    if (!seen.has(msg.sessionId)) {
      seen.add(msg.sessionId);
      sessions.push({
        sessionId: msg.sessionId,
        lastMessage: msg.content.slice(0, 60),
        createdAt: msg.createdAt.toISOString(),
      });
    }
  }
  return sessions;
}

export async function getSessionMessages(userId: number, sessionId: string): Promise<ChatMessage[]> {
  const msgs = await prisma.chatHistory.findMany({
    where: { userId, sessionId },
    orderBy: { createdAt: 'asc' },
  });
  return msgs.map((m) => ({
    id: m.id,
    sessionId: m.sessionId,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));
}

export async function deleteSession(userId: number, sessionId: string): Promise<void> {
  await prisma.chatHistory.deleteMany({ where: { userId, sessionId } });
}

export async function sendMessage(
  userId: number,
  sessionId: string,
  userContent: string
): Promise<{ reply: string; sessionId: string }> {
  if (!env.aiApiKey) {
    throw new AppError(503, 'AI_SERVICE_NOT_CONFIGURED', 'AI service is not configured');
  }

  const collision = await prisma.chatHistory.findFirst({
    where: { sessionId, NOT: { userId } },
  });
  if (collision) {
    throw new AppError(400, 'SESSION_ID_CONFLICT', 'sessionId 已被其他用户使用');
  }

  await prisma.chatHistory.create({
    data: { userId, sessionId, role: 'user', content: userContent },
  });

  const history = await prisma.chatHistory.findMany({
    where: { userId, sessionId },
    orderBy: { createdAt: 'desc' },
    take: MAX_HISTORY_MESSAGES,
  });

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.reverse().map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
  ];

  const completion = await openai.chat.completions.create({
    model: env.aiModel,
    messages,
  });

  const reply = completion.choices[0]?.message?.content ?? '';

  await prisma.chatHistory.create({
    data: { userId, sessionId, role: 'assistant', content: reply },
  });

  return { reply, sessionId };
}
