import prisma from './prisma';
import { AppError } from './app-error';

export async function ensureOwnedVisit(userId: number, visitId: number | null | undefined) {
  if (!visitId) return;

  const visit = await prisma.visit.findFirst({ where: { id: visitId, userId } });
  if (!visit) {
    throw new AppError(404, 'VISIT_NOT_FOUND', '关联的就诊记录不存在');
  }
}
