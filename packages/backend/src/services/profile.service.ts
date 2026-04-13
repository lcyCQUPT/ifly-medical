import prisma from '../lib/prisma';

export async function getProfile() {
  return prisma.profile.findFirst();
}

export async function upsertProfile(data: {
  name: string;
  gender?: string | null;
  birthDate?: Date | null;
  bloodType?: string | null;
  height?: number | null;
  weight?: number | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
}) {
  const existing = await prisma.profile.findFirst();
  if (existing) {
    return prisma.profile.update({ where: { id: existing.id }, data });
  }
  return prisma.profile.create({ data });
}
