import { Router } from 'express';
import { profileUpsertSchema } from '@ifly-medical/shared';
import { getProfile, upsertProfile } from '../controllers/profile.controller';
import { validateRequest } from '../middleware/validate';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.get('/', asyncHandler(getProfile));
router.put('/', validateRequest({ body: profileUpsertSchema }), asyncHandler(upsertProfile));

export default router;
