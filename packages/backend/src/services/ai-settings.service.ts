import type { AISettings, AISettingsUpdateInput } from '@ifly-medical/shared';
import prisma from '../lib/prisma';

const DEFAULT_SETTINGS = {
  includeGender: true,
  includeAge: true,
  includeBloodType: true,
  includeHeight: true,
  includeWeight: true,
  includeAllergies: true,
  includeChronic: true,
  includeName: false,
};

function toDto(settings: {
  id: number;
  includeGender: boolean;
  includeAge: boolean;
  includeBloodType: boolean;
  includeHeight: boolean;
  includeWeight: boolean;
  includeAllergies: boolean;
  includeChronic: boolean;
  includeName: boolean;
  updatedAt: Date;
}): AISettings {
  return {
    ...settings,
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export async function getOrCreateSettings(userId: number): Promise<AISettings> {
  let settings = await prisma.aISettings.findUnique({ where: { userId } });
  if (!settings) {
    settings = await prisma.aISettings.create({
      data: { userId, ...DEFAULT_SETTINGS },
    });
  }
  return toDto(settings);
}

export async function updateSettings(userId: number, data: AISettingsUpdateInput): Promise<AISettings> {
  const settings = await prisma.aISettings.upsert({
    where: { userId },
    update: data,
    create: { userId, ...DEFAULT_SETTINGS, ...data },
  });
  return toDto(settings);
}
