import { Router } from 'express';
import {
  medicationCreateSchema,
  medicationListQuerySchema,
  medicationUpdateSchema,
  medicationRecordIdParamsSchema,
} from '@ifly-medical/shared';
import {
  getMedications,
  getMedication,
  createMedication,
  updateMedication,
  deleteMedication,
} from '../controllers/medication.controller';
import { validateRequest } from '../middleware/validate';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.get('/', validateRequest({ query: medicationListQuerySchema }), asyncHandler(getMedications));
router.get('/:id', validateRequest({ params: medicationRecordIdParamsSchema }), asyncHandler(getMedication));
router.post('/', validateRequest({ body: medicationCreateSchema }), asyncHandler(createMedication));
router.put('/:id', validateRequest({ params: medicationRecordIdParamsSchema, body: medicationUpdateSchema }), asyncHandler(updateMedication));
router.delete('/:id', validateRequest({ params: medicationRecordIdParamsSchema }), asyncHandler(deleteMedication));

export default router;
