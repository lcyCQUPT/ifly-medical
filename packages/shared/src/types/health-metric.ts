import type { MetricStatus } from '../constants/health-metric-ranges';
import type { HealthMetricTypeValue } from '../constants/health-metric-types';

export interface HealthMetric {
  id: number;
  type: HealthMetricTypeValue;
  value: number;
  unit?: string;
  recordedAt: string;
  visitId?: number;
  notes?: string;
  status?: MetricStatus;
}

export interface PaginatedMetrics {
  data: HealthMetric[];
  total: number;
}
