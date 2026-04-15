import type { Request, Response } from 'express';
import type { AISettingsUpdateInput } from '@ifly-medical/shared';
import { getRequestUser } from '../types/request-user';
import * as aiSettingsService from '../services/ai-settings.service';

export async function getSettings(req: Request, res: Response) {
  const settings = await aiSettingsService.getOrCreateSettings(getRequestUser(req).userId);
  res.json(settings);
}

export async function updateSettings(req: Request, res: Response) {
  const data = req.body as AISettingsUpdateInput;
  const settings = await aiSettingsService.updateSettings(getRequestUser(req).userId, data);
  res.json(settings);
}
