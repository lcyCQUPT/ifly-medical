export const HealthMetricType = {
  SYSTOLIC_BLOOD_PRESSURE: 'systolic_blood_pressure',
  DIASTOLIC_BLOOD_PRESSURE: 'diastolic_blood_pressure',
  BLOOD_SUGAR: 'blood_sugar',
  WEIGHT: 'weight',
  HEART_RATE: 'heart_rate',
} as const;

export type HealthMetricTypeValue = typeof HealthMetricType[keyof typeof HealthMetricType];

export const HEALTH_METRIC_TYPE_VALUES = [
  HealthMetricType.SYSTOLIC_BLOOD_PRESSURE,
  HealthMetricType.DIASTOLIC_BLOOD_PRESSURE,
  HealthMetricType.BLOOD_SUGAR,
  HealthMetricType.WEIGHT,
  HealthMetricType.HEART_RATE,
] as const satisfies readonly [HealthMetricTypeValue, ...HealthMetricTypeValue[]];

export const HealthMetricLabels: Record<HealthMetricTypeValue, string> = {
  systolic_blood_pressure: '收缩压',
  diastolic_blood_pressure: '舒张压',
  blood_sugar: '血糖',
  weight: '体重',
  heart_rate: '心率',
};
