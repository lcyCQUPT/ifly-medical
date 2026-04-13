import { Request, Response } from 'express';
import * as visitService from '../services/visit.service';

export async function getVisits(req: Request, res: Response) {
  const pageParam = typeof req.query.page === 'string' ? req.query.page : '';
  const limitParam = typeof req.query.limit === 'string' ? req.query.limit : '';
  const page = Math.max(1, parseInt(pageParam) || 1);
  const limit = Math.max(1, parseInt(limitParam) || 10);
  const result = await visitService.getVisits(page, limit);
  res.json(result);
}

export async function getVisit(req: Request, res: Response) {
  const idParam = typeof req.params.id === 'string' ? req.params.id : '';
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: '无效的记录 ID' });
    return;
  }
  const visit = await visitService.getVisit(id);
  if (!visit) {
    res.status(404).json({ error: '就诊记录不存在' });
    return;
  }
  res.json(visit);
}

export async function createVisit(req: Request, res: Response) {
  const { visitDate, hospital, department, chiefComplaint, diagnosis, doctorAdvice, notes } = req.body;
  if (!visitDate || typeof visitDate !== 'string') {
    res.status(400).json({ error: '就诊日期为必填项' });
    return;
  }
  if (!hospital || typeof hospital !== 'string') {
    res.status(400).json({ error: '医院为必填项' });
    return;
  }
  const visit = await visitService.createVisit({
    visitDate: new Date(visitDate),
    hospital,
    department: department ?? null,
    chiefComplaint: chiefComplaint ?? null,
    diagnosis: diagnosis ?? null,
    doctorAdvice: doctorAdvice ?? null,
    notes: notes ?? null,
  });
  res.status(201).json(visit);
}

export async function updateVisit(req: Request, res: Response) {
  const idParam = typeof req.params.id === 'string' ? req.params.id : '';
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: '无效的记录 ID' });
    return;
  }
  const { visitDate, hospital, department, chiefComplaint, diagnosis, doctorAdvice, notes } = req.body;
  const data: Partial<visitService.VisitInput> = {};
  if (visitDate !== undefined) data.visitDate = new Date(visitDate);
  if (hospital !== undefined) data.hospital = hospital;
  if (department !== undefined) data.department = department ?? null;
  if (chiefComplaint !== undefined) data.chiefComplaint = chiefComplaint ?? null;
  if (diagnosis !== undefined) data.diagnosis = diagnosis ?? null;
  if (doctorAdvice !== undefined) data.doctorAdvice = doctorAdvice ?? null;
  if (notes !== undefined) data.notes = notes ?? null;

  const visit = await visitService.updateVisit(id, data);
  if (!visit) {
    res.status(404).json({ error: '就诊记录不存在' });
    return;
  }
  res.json(visit);
}

export async function deleteVisit(req: Request, res: Response) {
  const idParam = typeof req.params.id === 'string' ? req.params.id : '';
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: '无效的记录 ID' });
    return;
  }
  const ok = await visitService.deleteVisit(id);
  if (!ok) {
    res.status(404).json({ error: '就诊记录不存在' });
    return;
  }
  res.json({ success: true });
}
