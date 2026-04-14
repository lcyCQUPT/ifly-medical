import { HEALTH_METRIC_RANGES, type MetricStatus } from '../constants/health-metric-ranges';

export function getMetricStatus(type: string, value: number, unit?: string): MetricStatus {
  const range = HEALTH_METRIC_RANGES[type];
  if (!range) return 'normal';

  if (unit && unit !== range.unit) return 'normal';

  if (value < range.min || value > range.max) {
    return 'abnormal';
  }

  return 'normal';
}

export function getMetricRangeDescription(type: string): string | null {
  const range = HEALTH_METRIC_RANGES[type];
  if (!range) return null;
  return `${range.min}-${range.max} ${range.unit}`;
}
