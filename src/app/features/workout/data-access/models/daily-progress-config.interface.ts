export interface DailyProgressMetricConfig {
  label: string;
  value?: number;
  goal: number;
  valueLabel: string;
  color: string;
}

export interface DailyProgressConfig {
  title: string;
  metrics: readonly DailyProgressMetricConfig[];
}
