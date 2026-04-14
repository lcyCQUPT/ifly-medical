import { Request, Response } from 'express';
import type { ChatMessageCreateInput } from '@ifly-medical/shared';
import { AppError } from '../lib/app-error';
import { getRequestUser } from '../types/request-user';
import * as chatService from '../services/chat.service';
import { getValidated } from '../middleware/validate';

export async function postMessage(req: Request, res: Response) {
  const { sessionId, content } = req.body as ChatMessageCreateInput;

  try {
    const result = await chatService.sendMessage(getRequestUser(req).userId, sessionId, content);
    res.json(result);
  } catch {
    throw new AppError(500, 'AI_SERVICE_UNAVAILABLE', 'AI 服务暂时不可用，请稍后重试');
  }
}

export async function getSessions(req: Request, res: Response) {
  const sessions = await chatService.getSessions(getRequestUser(req).userId);
  res.json(sessions);
}

export async function getSessionMessages(req: Request, res: Response) {
  const { sessionId } = getValidated<{ sessionId: string }>(res, 'params');
  const messages = await chatService.getSessionMessages(getRequestUser(req).userId, sessionId);
  res.json(messages);
}

export async function deleteSession(req: Request, res: Response) {
  const { sessionId } = getValidated<{ sessionId: string }>(res, 'params');
  await chatService.deleteSession(getRequestUser(req).userId, sessionId);
  res.status(204).send();
}
