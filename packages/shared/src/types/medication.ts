export interface Medication {
  id: number;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  visitId?: number;
  notes?: string;
}

export interface PaginatedMedications {
  data: Medication[];
  total: number;
}
