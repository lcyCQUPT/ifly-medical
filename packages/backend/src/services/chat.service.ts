import OpenAI from 'openai';
import type { ChatMessage, ChatSession } from '@ifly-medical/shared';
import prisma from '../lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || 'MISSING_KEY',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

const SYSTEM_PROMPT =
  '你是专业的健康助手，根据用户信息给出健康建议，仅供参考，不构成医疗诊断。';

export async function getSessions(): Promise<ChatSession[]> {
  const all = await prisma.chatHistory.findMany({
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

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const msgs = await prisma.chatHistory.findMany({
    where: { sessionId },
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

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.chatHistory.deleteMany({ where: { sessionId } });
}

export async function sendMessage(
  sessionId: string,
  userContent: string
): Promise<{ reply: string; sessionId: string }> {
  // 先存用户消息，确保即使 AI 调用失败也不丢失
  await prisma.chatHistory.create({
    data: { sessionId, role: 'user', content: userContent },
  });

  const history = await prisma.chatHistory.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((h) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
  ];

  const completion = await openai.chat.completions.create({
    model: 'qwen-plus',
    messages,
  });

  const reply = completion.choices[0]?.message?.content ?? '';

  // AI 回复单独插入，时间戳必然晚于用户消息，顺序稳定
  await prisma.chatHistory.create({
    data: { sessionId, role: 'assistant', content: reply },
  });

  return { reply, sessionId };
}
