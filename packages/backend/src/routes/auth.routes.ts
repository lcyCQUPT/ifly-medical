import { Router } from 'express';
import { authCredentialsSchema } from '@ifly-medical/shared';
import { login, me, register } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.post('/register', validateRequest({ body: authCredentialsSchema }), asyncHandler(register));
router.post('/login', validateRequest({ body: authCredentialsSchema }), asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
