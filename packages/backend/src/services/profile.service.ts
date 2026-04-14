import prisma from '../lib/prisma';

export async function getProfile(userId: number) {
  return prisma.profile.findUnique({ where: { userId } });
}

export async function upsertProfile(
  userId: number,
  data: {
    name: string;
    gender?: string | null;
    birthDate?: Date | null;
    bloodType?: string | null;
    height?: number | null;
    weight?: number | null;
    allergies?: string | null;
    chronicDiseases?: string | null;
  }
) {
  return prisma.profile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}
