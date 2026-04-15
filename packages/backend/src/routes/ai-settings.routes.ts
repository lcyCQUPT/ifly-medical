import { Router } from 'express';
import { aiSettingsUpdateSchema } from '@ifly-medical/shared';
import { asyncHandler } from '../lib/async-handler';
import { validateRequest } from '../middleware/validate';
import { getSettings, updateSettings } from '../controllers/ai-settings.controller';

const router = Router();

router.get('/', asyncHandler(getSettings));
router.put('/', validateRequest({ body: aiSettingsUpdateSchema }), asyncHandler(updateSettings));

export default router;
