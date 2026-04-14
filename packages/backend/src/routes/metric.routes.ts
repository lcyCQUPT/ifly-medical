import { Router } from 'express';
import {
  metricCreateSchema,
  metricListQuerySchema,
  metricTrendParamsSchema,
  metricRecordIdParamsSchema,
} from '@ifly-medical/shared';
import {
  getMetrics,
  getMetricTrend,
  getMetric,
  createMetric,
  deleteMetric,
} from '../controllers/metric.controller';
import { validateRequest } from '../middleware/validate';
import { asyncHandler } from '../lib/async-handler';

const router = Router();

router.get('/', validateRequest({ query: metricListQuerySchema }), asyncHandler(getMetrics));
router.get('/trend/:type', validateRequest({ params: metricTrendParamsSchema }), asyncHandler(getMetricTrend));
router.get('/:id', validateRequest({ params: metricRecordIdParamsSchema }), asyncHandler(getMetric));
router.post('/', validateRequest({ body: metricCreateSchema }), asyncHandler(createMetric));
router.delete('/:id', validateRequest({ params: metricRecordIdParamsSchema }), asyncHandler(deleteMetric));

export default router;
