import type { HealthMetricTypeValue } from './health-metric-types';
import { HealthMetricType } from './health-metric-types';

export interface MetricUnitOption {
  value: string;
  label: string;
}

export const HEALTH_METRIC_UNIT_OPTIONS: Record<HealthMetricTypeValue, MetricUnitOption[]> = {
  [HealthMetricType.SYSTOLIC_BLOOD_PRESSURE]: [
    { value: 'mmHg', label: 'mmHg' },
  ],
  [HealthMetricType.DIASTOLIC_BLOOD_PRESSURE]: [
    { value: 'mmHg', label: 'mmHg' },
  ],
  [HealthMetricType.BLOOD_SUGAR]: [
    { value: 'mmol/L', label: 'mmol/L' },
    { value: 'mg/dL', label: 'mg/dL' },
  ],
  [HealthMetricType.WEIGHT]: [
    { value: 'kg', label: '公斤' },
    { value: '斤', label: '斤' },
  ],
  [HealthMetricType.HEART_RATE]: [
    { value: 'bpm', label: 'bpm' },
  ],
};

export const HEALTH_METRIC_DEFAULT_UNITS: Record<HealthMetricTypeValue, string> = {
  [HealthMetricType.SYSTOLIC_BLOOD_PRESSURE]: 'mmHg',
  [HealthMetricType.DIASTOLIC_BLOOD_PRESSURE]: 'mmHg',
  [HealthMetricType.BLOOD_SUGAR]: 'mmol/L',
  [HealthMetricType.WEIGHT]: 'kg',
  [HealthMetricType.HEART_RATE]: 'bpm',
};
