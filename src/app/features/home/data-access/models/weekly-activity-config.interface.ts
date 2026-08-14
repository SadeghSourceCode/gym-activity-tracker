export interface WeeklyActivityDayConfig {
  dateKey: string;
  dayLabel: string;
  minutes: number;
  selected?: boolean;
}

export interface WeeklyActivityConfig {
  title: string;
  periodLabel: string;
  durationLabel: string;
  days: readonly WeeklyActivityDayConfig[];
}
