import { Router } from 'express';
import {
  postMessage,
  getSessions,
  getSessionMessages,
  deleteSession,
} from '../controllers/chat.controller';

const router = Router();

router.post('/', postMessage);
router.get('/history', getSessions);
router.get('/history/:sessionId', getSessionMessages);
router.delete('/history/:sessionId', deleteSession);

export default router;
