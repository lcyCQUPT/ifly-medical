import { Router } from 'express';
import { chatMessageCreateSchema, chatSessionParamsSchema } from '@ifly-medical/shared';
import {
  postMessage,
  getSessions,
  getSessionMessages,
  deleteSession,
} from '../controllers/chat.controller';
import { validateRequest } from '../middleware/validate';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.post('/', validateRequest({ body: chatMessageCreateSchema }), asyncHandler(postMessage));
router.get('/history', asyncHandler(getSessions));
router.get('/history/:sessionId', validateRequest({ params: chatSessionParamsSchema }), asyncHandler(getSessionMessages));
router.delete('/history/:sessionId', validateRequest({ params: chatSessionParamsSchema }), asyncHandler(deleteSession));

export default router;
