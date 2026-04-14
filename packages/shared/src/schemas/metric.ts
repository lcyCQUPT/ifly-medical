import { z } from 'zod';
import { isoDateString, nullableTrimmedString, paginationQuerySchema, positiveIntId } from './common';
import { HEALTH_METRIC_TYPE_VALUES } from '../constants/health-metric-types';

const nullableVisitId = z.union([positiveIntId, z.null(), z.undefined()]).transform((value) => value ?? null);

export const metricCreateSchema = z.object({
  type: z.enum(HEALTH_METRIC_TYPE_VALUES, {
    message: '指标类型无效',
  }),
  value: z.number().finite('数值必须为数字').min(0, '数值不能小于 0'),
  unit: nullableTrimmedString,
  recordedAt: isoDateString,
  visitId: nullableVisitId,
  notes: nullableTrimmedString,
});

export const metricListQuerySchema = paginationQuerySchema.extend({
  type: z.enum(HEALTH_METRIC_TYPE_VALUES).optional(),
});

export const metricTrendParamsSchema = z.object({
  type: z.enum(HEALTH_METRIC_TYPE_VALUES, {
    message: '无效的指标类型',
  }),
});

export const metricRecordIdParamsSchema = z.object({ id: positiveIntId });

export type MetricCreateInput = z.infer<typeof metricCreateSchema>;
export type MetricListQueryInput = z.infer<typeof metricListQuerySchema>;
export type MetricTrendParamsInput = z.infer<typeof metricTrendParamsSchema>;
