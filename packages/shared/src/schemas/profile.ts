import { z } from 'zod';
import { isoDateString, nullableTrimmedString } from './common';

export const profileUpsertSchema = z.object({
  name: z.string().trim().min(1, '姓名为必填项').max(50, '姓名不能超过 50 个字符'),
  gender: nullableTrimmedString,
  birthDate: z.union([isoDateString, z.null(), z.undefined()]).transform((value) => value ?? null),
  bloodType: nullableTrimmedString,
  height: z.union([z.number().min(0).max(300), z.null(), z.undefined()]).transform((value) => value ?? null),
  weight: z.union([z.number().min(0).max(500), z.null(), z.undefined()]).transform((value) => value ?? null),
  allergies: nullableTrimmedString,
  chronicDiseases: nullableTrimmedString,
});

export type ProfileUpsertInput = z.infer<typeof profileUpsertSchema>;
