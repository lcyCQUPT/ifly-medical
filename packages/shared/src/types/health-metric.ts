export interface HealthMetric {
  id: number;
  type: string;
  value: number;
  unit?: string;
  recordedAt: string;
  visitId?: number;
  notes?: string;
}
