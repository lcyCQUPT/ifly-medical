import { Request, Response } from 'express';
import * as chatService from '../services/chat.service';

export async function postMessage(req: Request, res: Response) {
  const { sessionId, content } = req.body;
  if (!sessionId || typeof sessionId !== 'string') {
    res.status(400).json({ error: 'sessionId 为必填项' });
    return;
  }
  if (!content || typeof content !== 'string') {
    res.status(400).json({ error: 'content 为必填项' });
    return;
  }
  const result = await chatService.sendMessage(sessionId, content);
  res.json(result);
}

export async function getSessions(_req: Request, res: Response) {
  const sessions = await chatService.getSessions();
  res.json(sessions);
}

export async function getSessionMessages(req: Request, res: Response) {
  const sessionId = typeof req.params.sessionId === 'string' ? req.params.sessionId : '';
  const messages = await chatService.getSessionMessages(sessionId);
  res.json(messages);
}

export async function deleteSession(req: Request, res: Response) {
  const sessionId = typeof req.params.sessionId === 'string' ? req.params.sessionId : '';
  await chatService.deleteSession(sessionId);
  res.status(204).send();
}
