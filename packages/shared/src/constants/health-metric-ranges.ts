import { HealthMetricType } from './health-metric-types';

export interface MetricRange {
  min: number;
  max: number;
  unit: string;
}

// 预设医学参考范围
export const HEALTH_METRIC_RANGES: Partial<Record<string, MetricRange>> = {
  [HealthMetricType.SYSTOLIC_BLOOD_PRESSURE]: { min: 90, max: 140, unit: 'mmHg' },
  [HealthMetricType.DIASTOLIC_BLOOD_PRESSURE]: { min: 60, max: 90, unit: 'mmHg' },
  [HealthMetricType.BLOOD_SUGAR]: { min: 3.9, max: 6.1, unit: 'mmol/L' },
  [HealthMetricType.HEART_RATE]: { min: 60, max: 100, unit: 'bpm' },
  // 体重不设预警范围（因人而异）
};

export type MetricStatus = 'normal' | 'abnormal';
