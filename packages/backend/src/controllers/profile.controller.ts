import { Request, Response } from 'express';
import type { ProfileUpsertInput } from '@ifly-medical/shared';
import { AppError } from '../lib/app-error';
import { getRequestUser } from '../types/request-user';
import * as profileService from '../services/profile.service';

export async function getProfile(req: Request, res: Response) {
  const profile = await profileService.getProfile(getRequestUser(req).userId);
  if (!profile) {
    throw new AppError(404, 'PROFILE_NOT_FOUND', '档案不存在');
  }
  res.json(profile);
}

export async function upsertProfile(req: Request, res: Response) {
  const body = req.body as ProfileUpsertInput;
  const profile = await profileService.upsertProfile(getRequestUser(req).userId, {
    ...body,
    birthDate: body.birthDate ? new Date(body.birthDate) : null,
  });
  res.json(profile);
}
