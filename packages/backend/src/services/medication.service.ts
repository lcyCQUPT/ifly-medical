import type { Medication as PrismaMedication } from '@prisma/client';
import type { Medication, PaginatedMedications } from '@ifly-medical/shared';
import prisma from '../lib/prisma';
import { AppError } from '../lib/app-error';
import { ensureOwnedVisit } from '../lib/service-helpers';

export interface MedicationInput {
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive?: boolean;
  visitId?: number | null;
  notes?: string | null;
}

function toDto(m: PrismaMedication): Medication {
  return {
    id: m.id,
    name: m.name,
    dosage: m.dosage ?? undefined,
    frequency: m.frequency ?? undefined,
    startDate: m.startDate?.toISOString(),
    endDate: m.endDate?.toISOString(),
    isActive: m.isActive,
    visitId: m.visitId ?? undefined,
    notes: m.notes ?? undefined,
  };
}

async function getOwnedMedicationRecord(userId: number, id: number) {
  const medication = await prisma.medication.findFirst({ where: { id, userId } });
  if (!medication) {
    throw new AppError(404, 'MEDICATION_NOT_FOUND', '用药记录不存在');
  }
  return medication;
}

export async function getMedications(
  userId: number,
  page: number,
  limit: number,
  isActive?: boolean
): Promise<PaginatedMedications> {
  const where = isActive !== undefined ? { userId, isActive } : { userId };
  const [data, total] = await prisma.$transaction([
    prisma.medication.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: 'desc' },
    }),
    prisma.medication.count({ where }),
  ]);
  return { data: data.map(toDto), total };
}

export async function getMedication(userId: number, id: number) {
  return toDto(await getOwnedMedicationRecord(userId, id));
}

export async function createMedication(userId: number, data: MedicationInput) {
  await ensureOwnedVisit(userId, data.visitId);
  return toDto(await prisma.medication.create({ data: { userId, ...data } }));
}

export async function updateMedication(userId: number, id: number, data: Partial<MedicationInput>) {
  await getOwnedMedicationRecord(userId, id);
  await ensureOwnedVisit(userId, data.visitId);
  return toDto(await prisma.medication.update({ where: { id }, data }));
}

export async function deleteMedication(userId: number, id: number) {
  await getOwnedMedicationRecord(userId, id);
  await prisma.medication.delete({ where: { id } });
}
