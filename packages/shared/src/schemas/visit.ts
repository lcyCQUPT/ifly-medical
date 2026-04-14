import { z } from 'zod';
import { isoDateString, nullableTrimmedString, paginationQuerySchema, positiveIntId } from './common';

const visitBaseSchema = z.object({
  visitDate: isoDateString,
  hospital: z.string().trim().min(1, '医院为必填项').max(100, '医院名称不能超过 100 个字符'),
  department: nullableTrimmedString,
  chiefComplaint: nullableTrimmedString,
  diagnosis: nullableTrimmedString,
  doctorAdvice: nullableTrimmedString,
  notes: nullableTrimmedString,
});

export const visitCreateSchema = visitBaseSchema;
export const visitUpdateSchema = visitBaseSchema.partial();
export const visitListQuerySchema = paginationQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
export const visitRecordIdParamsSchema = z.object({ id: positiveIntId });
export const attachmentParamsSchema = z.object({
  id: positiveIntId,
  filename: z
    .string()
    .min(1, '无效的文件名')
    .regex(/^[^/\\]+$/, '文件名不得包含路径分隔符')
    .refine((value) => !value.includes('..'), '文件名不得包含路径遍历字符'),
});

export type VisitCreateInput = z.infer<typeof visitCreateSchema>;
export type VisitUpdateInput = z.infer<typeof visitUpdateSchema>;
