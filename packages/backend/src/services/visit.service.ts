import type { Visit as PrismaVisit } from '@prisma/client';
import type { Visit } from '@ifly-medical/shared';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';
import { AppError } from '../lib/app-error';

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

async function getOwnedVisitRecord(userId: number, id: number) {
  const visit = await prisma.visit.findFirst({ where: { id, userId } });
  if (!visit) {
    throw new AppError(404, 'VISIT_NOT_FOUND', '就诊记录不存在');
  }
  return visit;
}

export async function getVisits(userId: number, page: number, limit: number) {
  const where = { userId };
  const [data, total] = await prisma.$transaction([
    prisma.visit.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { visitDate: 'desc' },
    }),
    prisma.visit.count({ where }),
  ]);
  return { data: data.map(toDto), total };
}

export async function getVisit(userId: number, id: number) {
  return toDto(await getOwnedVisitRecord(userId, id));
}

export async function createVisit(userId: number, data: VisitInput) {
  return toDto(await prisma.visit.create({ data: { userId, ...data } }));
}

export async function updateVisit(userId: number, id: number, data: Partial<VisitInput>) {
  await getOwnedVisitRecord(userId, id);
  return toDto(await prisma.visit.update({ where: { id }, data }));
}

export async function deleteVisit(userId: number, id: number) {
  await getOwnedVisitRecord(userId, id);
  await prisma.visit.delete({ where: { id } });
}

export async function addAttachment(
  userId: number,
  visitId: number,
  attachment: { name: string; url: string; size: number; uploadedAt: string }
) {
  const existing = await getOwnedVisitRecord(userId, visitId);
  const list = existing.attachments ? JSON.parse(existing.attachments) : [];
  list.push(attachment);
  return toDto(
    await prisma.visit.update({ where: { id: visitId }, data: { attachments: JSON.stringify(list) } })
  );
}

export async function removeAttachment(userId: number, visitId: number, filename: string) {
  const existing = await getOwnedVisitRecord(userId, visitId);
  const list: { name: string; url: string; size: number; uploadedAt: string }[] =
    existing.attachments ? JSON.parse(existing.attachments) : [];
  const filtered = list.filter((att) => !att.url.endsWith(`/${filename}`));
  if (filtered.length === list.length) {
    throw new AppError(404, 'ATTACHMENT_NOT_FOUND', '附件不存在');
  }
  const safeFilename = path.basename(filename);
  const filePath = path.join(__dirname, '../../uploads/visits', String(visitId), safeFilename);
  try {
    await fs.promises.unlink(filePath);
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      console.warn('[visit.service] Failed to delete file:', filePath, err.message);
    }
  }
  return toDto(
    await prisma.visit.update({ where: { id: visitId }, data: { attachments: JSON.stringify(filtered) } })
  );
}
