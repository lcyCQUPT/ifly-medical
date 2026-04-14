import { z } from 'zod';
import { isoDateString, nullableTrimmedString, paginationQuerySchema, positiveIntId } from './common';

const nullableVisitId = z.union([positiveIntId, z.null(), z.undefined()]).transform((value) => value ?? null);

const medicationBaseSchema = z.object({
  name: z.string().trim().min(1, '药品名称为必填项').max(100, '药品名称不能超过 100 个字符'),
  dosage: nullableTrimmedString,
  frequency: nullableTrimmedString,
  startDate: z.union([isoDateString, z.null(), z.undefined()]).transform((value) => value ?? null),
  endDate: z.union([isoDateString, z.null(), z.undefined()]).transform((value) => value ?? null),
  isActive: z.boolean().default(true),
  visitId: nullableVisitId,
  notes: nullableTrimmedString,
});

export const medicationCreateSchema = medicationBaseSchema;
export const medicationUpdateSchema = medicationBaseSchema.partial();
export const medicationListQuerySchema = paginationQuerySchema.extend({
  isActive: z.enum(['true', 'false']).optional(),
});
export const medicationRecordIdParamsSchema = z.object({ id: positiveIntId });

export type MedicationCreateInput = z.infer<typeof medicationCreateSchema>;
export type MedicationUpdateInput = z.infer<typeof medicationUpdateSchema>;
export type MedicationListQueryInput = z.infer<typeof medicationListQuerySchema>;
