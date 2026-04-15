export interface AISettings {
  id: number;
  includeGender: boolean;
  includeAge: boolean;
  includeBloodType: boolean;
  includeHeight: boolean;
  includeWeight: boolean;
  includeAllergies: boolean;
  includeChronic: boolean;
  includeName: boolean;
  updatedAt: string;
}

export type AISettingsUpdateInput = Partial<Omit<AISettings, 'id' | 'updatedAt'>>;
