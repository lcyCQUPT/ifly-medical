import { z } from 'zod';

export const aiSettingsUpdateSchema = z.object({
  includeGender: z.boolean().optional(),
  includeAge: z.boolean().optional(),
  includeBloodType: z.boolean().optional(),
  includeHeight: z.boolean().optional(),
  includeWeight: z.boolean().optional(),
  includeAllergies: z.boolean().optional(),
  includeChronic: z.boolean().optional(),
  includeName: z.boolean().optional(),
});
