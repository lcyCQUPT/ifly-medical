export interface OptionItem {
  value: string;
  label: string;
}

export const MEDICATION_DOSAGE_UNITS: OptionItem[] = [
  { value: 'mg', label: 'mg' },
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
  { value: '片', label: '片' },
  { value: '粒', label: '粒' },
  { value: '袋', label: '袋' },
  { value: '滴', label: '滴' },
];

export const MEDICATION_FREQUENCY_PERIODS: OptionItem[] = [
  { value: '每日', label: '每日' },
  { value: '每周', label: '每周' },
  { value: '每月', label: '每月' },
];

export const MEDICATION_FREQUENCY_TIMES: OptionItem[] = [
  { value: '1次', label: '1次' },
  { value: '2次', label: '2次' },
  { value: '3次', label: '3次' },
  { value: '4次', label: '4次' },
];
