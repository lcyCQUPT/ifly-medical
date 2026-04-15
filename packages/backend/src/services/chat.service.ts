import OpenAI from 'openai';
import type { AISettings, ChatMessage, ChatSession } from '@ifly-medical/shared';
import prisma from '../lib/prisma';
import { env } from '../config/env';
import { AppError } from '../lib/app-error';
import * as aiSettingsService from './ai-settings.service';
import * as profileService from './profile.service';

const openai = new OpenAI({
  apiKey: env.aiApiKey ?? undefined,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

const SYSTEM_PROMPT =
  '你是专业的健康助手，根据用户信息给出健康建议，仅供参考，不构成医疗诊断。';
const MAX_HISTORY_MESSAGES = 20;

function getAgeText(birthDate: Date | null | undefined) {
  if (!birthDate) {
    return null;
  }
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 0 || age >= 150) {
    return null;
  }
  return `${age}岁`;
}

function buildUserProfilePrompt(
  profile: Awaited<ReturnType<typeof profileService.getProfile>>,
  settings: AISettings
) {
  if (!profile) {
    return '';
  }

  const parts: string[] = [];
  if (settings.includeName && profile.name) {
    parts.push(`姓名：${profile.name}`);
  }
  if (settings.includeGender && profile.gender) {
    parts.push(`性别：${profile.gender}`);
  }
  const ageText = settings.includeAge ? getAgeText(profile.birthDate) : null;
  if (ageText) {
    parts.push(`年龄：${ageText}`);
  }
  if (settings.includeBloodType && profile.bloodType) {
    parts.push(`血型：${profile.bloodType}`);
  }
  if (settings.includeHeight && profile.height != null) {
    parts.push(`身高：${profile.height}cm`);
  }
  if (settings.includeWeight && profile.weight != null) {
    parts.push(`体重：${profile.weight}kg`);
  }
  if (settings.includeAllergies && profile.allergies) {
    parts.push(`过敏史：${profile.allergies}`);
  }
  if (settings.includeChronic && profile.chronicDiseases) {
    parts.push(`慢性病史：${profile.chronicDiseases}`);
  }
  return parts.length > 0 ? `用户信息：${parts.join('，')}` : '';
}

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

  const [profile, aiSettings] = await Promise.all([
    profileService.getProfile(userId),
    aiSettingsService.getOrCreateSettings(userId),
  ]);
  const userProfilePrompt = buildUserProfilePrompt(profile, aiSettings);
  const systemPrompt = userProfilePrompt ? `${SYSTEM_PROMPT}\n\n${userProfilePrompt}` : SYSTEM_PROMPT;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
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
