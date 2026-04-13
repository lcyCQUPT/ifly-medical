import { Request, Response } from 'express';
import * as profileService from '../services/profile.service';

export async function getProfile(_req: Request, res: Response) {
  const profile = await profileService.getProfile();
  if (!profile) {
    res.status(404).json({ error: '档案不存在' });
    return;
  }
  res.json(profile);
}

export async function upsertProfile(req: Request, res: Response) {
  const { name, gender, birthDate, bloodType, height, weight, allergies, chronicDiseases } = req.body;

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: '姓名为必填项' });
    return;
  }

  const profile = await profileService.upsertProfile({
    name,
    gender: gender ?? null,
    birthDate: birthDate ? new Date(birthDate) : null,
    bloodType: bloodType ?? null,
    height: height ?? null,
    weight: weight ?? null,
    allergies: allergies ?? null,
    chronicDiseases: chronicDiseases ?? null,
  });

  res.json(profile);
}
