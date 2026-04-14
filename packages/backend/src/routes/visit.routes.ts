import { Router } from 'express';
import {
  attachmentParamsSchema,
  visitRecordIdParamsSchema,
  visitCreateSchema,
  visitListQuerySchema,
  visitUpdateSchema,
} from '@ifly-medical/shared';
import { getVisits, getVisit, createVisit, updateVisit, deleteVisit, uploadAttachment, deleteAttachment } from '../controllers/visit.controller';
import { validateRequest } from '../middleware/validate';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.get('/', validateRequest({ query: visitListQuerySchema }), asyncHandler(getVisits));
router.get('/:id', validateRequest({ params: visitRecordIdParamsSchema }), asyncHandler(getVisit));
router.post('/', validateRequest({ body: visitCreateSchema }), asyncHandler(createVisit));
router.put('/:id', validateRequest({ params: visitRecordIdParamsSchema, body: visitUpdateSchema }), asyncHandler(updateVisit));
router.delete('/:id', validateRequest({ params: visitRecordIdParamsSchema }), asyncHandler(deleteVisit));
router.post('/:id/attachments', validateRequest({ params: visitRecordIdParamsSchema }), asyncHandler(uploadAttachment));
router.delete('/:id/attachments/:filename', validateRequest({ params: attachmentParamsSchema }), asyncHandler(deleteAttachment));

export default router;
