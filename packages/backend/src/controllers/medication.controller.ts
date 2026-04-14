import { Request, Response } from 'express';
import type { MedicationCreateInput, MedicationListQueryInput, MedicationUpdateInput } from '@ifly-medical/shared';
import { getRequestUser } from '../types/request-user';
import * as medicationService from '../services/medication.service';
import { getValidated } from '../middleware/validate';

export async function getMedications(req: Request, res: Response) {
  const { page, limit, isActive } = getValidated<MedicationListQueryInput>(res, 'query');
  const medications = await medicationService.getMedications(
    getRequestUser(req).userId,
    page,
    limit,
    isActive === undefined ? undefined : isActive === 'true'
  );
  res.json(medications);
}

export async function getMedication(req: Request, res: Response) {
  const { id } = getValidated<{ id: number }>(res, 'params');
  const medication = await medicationService.getMedication(getRequestUser(req).userId, id);
  res.json(medication);
}

export async function createMedication(req: Request, res: Response) {
  const body = req.body as MedicationCreateInput;
  const medication = await medicationService.createMedication(getRequestUser(req).userId, {
    ...body,
    startDate: body.startDate ? new Date(body.startDate) : null,
    endDate: body.endDate ? new Date(body.endDate) : null,
  });
  res.status(201).json(medication);
}

export async function updateMedication(req: Request, res: Response) {
  const { id } = getValidated<{ id: number }>(res, 'params');
  const body = req.body as MedicationUpdateInput;
  const medication = await medicationService.updateMedication(getRequestUser(req).userId, id, {
    ...body,
    startDate: body.startDate === undefined ? undefined : body.startDate ? new Date(body.startDate) : null,
    endDate: body.endDate === undefined ? undefined : body.endDate ? new Date(body.endDate) : null,
  });
  res.json(medication);
}

export async function deleteMedication(req: Request, res: Response) {
  const { id } = getValidated<{ id: number }>(res, 'params');
  await medicationService.deleteMedication(getRequestUser(req).userId, id);
  res.json({ success: true });
}
