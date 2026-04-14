import type { HealthMetric as PrismaHealthMetric } from '@prisma/client';
import type { HealthMetric, HealthMetricTypeValue, PaginatedMetrics } from '@ifly-medical/shared';
import { getMetricStatus } from '@ifly-medical/shared';
import prisma from '../lib/prisma';
import { AppError } from '../lib/app-error';
import { ensureOwnedVisit } from '../lib/service-helpers';

export interface MetricInput {
  type: HealthMetricTypeValue;
  value: number;
  unit?: string | null;
  recordedAt: Date;
  visitId?: number | null;
  notes?: string | null;
}

function toDto(m: PrismaHealthMetric): HealthMetric {
  const type = m.type as HealthMetricTypeValue;

  return {
    id: m.id,
    type,
    value: m.value,
    unit: m.unit ?? undefined,
    recordedAt: m.recordedAt.toISOString(),
    visitId: m.visitId ?? undefined,
    notes: m.notes ?? undefined,
    status: getMetricStatus(type, m.value, m.unit ?? undefined),
  };
}

async function getOwnedMetricRecord(userId: number, id: number) {
  const metric = await prisma.healthMetric.findFirst({ where: { id, userId } });
  if (!metric) {
    throw new AppError(404, 'METRIC_NOT_FOUND', '健康指标记录不存在');
  }
  return metric;
}

export async function getMetrics(
  userId: number,
  page: number,
  limit: number,
  type?: HealthMetricTypeValue
): Promise<PaginatedMetrics> {
  const where = type ? { userId, type } : { userId };
  const [data, total] = await prisma.$transaction([
    prisma.healthMetric.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { recordedAt: 'desc' },
    }),
    prisma.healthMetric.count({ where }),
  ]);
  return { data: data.map(toDto), total };
}

export async function getMetricTrend(userId: number, type: HealthMetricTypeValue, limit = 30) {
  const data = await prisma.healthMetric.findMany({
    where: { userId, type },
    orderBy: { recordedAt: 'desc' },
    take: limit,
  });
  return data.map(toDto).reverse();
}

export async function getMetric(userId: number, id: number) {
  return toDto(await getOwnedMetricRecord(userId, id));
}

export async function createMetric(userId: number, data: MetricInput) {
  await ensureOwnedVisit(userId, data.visitId);
  return toDto(await prisma.healthMetric.create({ data: { userId, ...data } }));
}

export async function deleteMetric(userId: number, id: number) {
  await getOwnedMetricRecord(userId, id);
  await prisma.healthMetric.delete({ where: { id } });
}
