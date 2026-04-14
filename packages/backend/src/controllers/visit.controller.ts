import { Request, Response } from 'express';
import type { Attachment, VisitCreateInput, VisitUpdateInput } from '@ifly-medical/shared';
import { getRequestUser } from '../types/request-user';
import * as visitService from '../services/visit.service';
import { uploadSingle, UPLOAD_ERROR } from '../middleware/upload';
import { getValidated } from '../middleware/validate';
import { env } from '../config/env';
import { AppError } from '../lib/app-error';

export async function getVisits(req: Request, res: Response) {
  const { page, limit } = getValidated<{ page: number; limit: number }>(res, 'query');
  const result = await visitService.getVisits(getRequestUser(req).userId, page, limit);
  res.json(result);
}

export async function getVisit(req: Request, res: Response) {
  const { id } = getValidated<{ id: number }>(res, 'params');
  const visit = await visitService.getVisit(getRequestUser(req).userId, id);
  res.json(visit);
}

export async function createVisit(req: Request, res: Response) {
  const body = req.body as VisitCreateInput;
  const visit = await visitService.createVisit(getRequestUser(req).userId, {
    ...body,
    visitDate: new Date(body.visitDate),
  });
  res.status(201).json(visit);
}

export async function updateVisit(req: Request, res: Response) {
  const { id } = getValidated<{ id: number }>(res, 'params');
  const body = req.body as VisitUpdateInput;
  const visit = await visitService.updateVisit(getRequestUser(req).userId, id, {
    ...body,
    visitDate: body.visitDate ? new Date(body.visitDate) : undefined,
  });
  res.json(visit);
}

export async function deleteVisit(req: Request, res: Response) {
  const { id } = getValidated<{ id: number }>(res, 'params');
  await visitService.deleteVisit(getRequestUser(req).userId, id);
  res.json({ success: true });
}

export async function uploadAttachment(req: Request, res: Response) {
  const { id } = getValidated<{ id: number }>(res, 'params');

  await visitService.getVisit(getRequestUser(req).userId, id);

  const ok = await new Promise<boolean>((resolve) => {
    uploadSingle(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: UPLOAD_ERROR });
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
  if (!ok) return;

  if (!req.file) {
    throw new AppError(400, 'FILE_NOT_RECEIVED', '未收到文件');
  }

  const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
  const attachment: Attachment = {
    name: originalName,
    url: `${env.baseUrl}/uploads/visits/${id}/${req.file.filename}`,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
  };

  await visitService.addAttachment(getRequestUser(req).userId, id, attachment);
  res.json({ data: attachment });
}

export async function deleteAttachment(req: Request, res: Response) {
  const { id, filename } = getValidated<{ id: number; filename: string }>(res, 'params');
  await visitService.removeAttachment(getRequestUser(req).userId, id, filename);
  res.json({ success: true });
}
