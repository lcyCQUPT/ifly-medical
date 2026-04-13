import type { Visit as PrismaVisit } from '@prisma/client';
import type { Visit } from '@ifly-medical/shared';
import prisma from '../lib/prisma';

export interface VisitInput {
  visitDate: Date;
  hospital: string;
  department?: string | null;
  chiefComplaint?: string | null;
  diagnosis?: string | null;
  doctorAdvice?: string | null;
  notes?: string | null;
}

function toDto(v: PrismaVisit): Visit {
  return {
    id: v.id,
    visitDate: v.visitDate.toISOString(),
    hospital: v.hospital,
    department: v.department ?? undefined,
    chiefComplaint: v.chiefComplaint ?? undefined,
    diagnosis: v.diagnosis ?? undefined,
    doctorAdvice: v.doctorAdvice ?? undefined,
    attachments: v.attachments ? JSON.parse(v.attachments) : undefined,
    notes: v.notes ?? undefined,
    createdAt: v.createdAt.toISOString(),
  };
}

export async function getVisits(page: number, limit: number) {
  const [data, total] = await prisma.$transaction([
    prisma.visit.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { visitDate: 'desc' },
    }),
    prisma.visit.count(),
  ]);
  return { data: data.map(toDto), total };
}

export async function getVisit(id: number) {
  const v = await prisma.visit.findUnique({ where: { id } });
  return v ? toDto(v) : null;
}

export async function createVisit(data: VisitInput) {
  return toDto(await prisma.visit.create({ data }));
}

export async function updateVisit(id: number, data: Partial<VisitInput>) {
  const existing = await prisma.visit.findUnique({ where: { id } });
  if (!existing) return null;
  return toDto(await prisma.visit.update({ where: { id }, data }));
}

export async function deleteVisit(id: number) {
  const existing = await prisma.visit.findUnique({ where: { id } });
  if (!existing) return false;
  await prisma.visit.delete({ where: { id } });
  return true;
}
