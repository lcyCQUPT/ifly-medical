import { Router } from 'express';
import { getVisits, getVisit, createVisit, updateVisit, deleteVisit, uploadAttachment } from '../controllers/visit.controller';

const router = Router();

router.get('/', getVisits);
router.get('/:id', getVisit);
router.post('/', createVisit);
router.put('/:id', updateVisit);
router.delete('/:id', deleteVisit);
router.post('/:id/attachments', uploadAttachment);

export default router;
