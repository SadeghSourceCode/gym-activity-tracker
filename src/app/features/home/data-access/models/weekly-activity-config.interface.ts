export type ActivityPeriod = 'week' | 'month' | 'year';

export interface ActivityPointConfig {
  dateKey: string;
  label: string;
  minutes: number;
  selected?: boolean;
}

export interface ActivityPeriodOptionConfig {
  id: ActivityPeriod;
  label: string;
}

export interface WeeklyActivityConfig {
  title: string;
  selectedPeriod: ActivityPeriod;
  periodOptions: readonly ActivityPeriodOptionConfig[];
  durationLabel: string;
  points: readonly ActivityPointConfig[];
}
