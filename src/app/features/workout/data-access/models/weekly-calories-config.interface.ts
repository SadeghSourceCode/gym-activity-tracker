export interface WeeklyCaloriesDayConfig {
  dateKey: string;
  dayLabel: string;
  calories: number;
  selected?: boolean;
}

export interface WeeklyCaloriesConfig {
  title: string;
  periodLabel: string;
  caloriesUnit: string;
  days: readonly WeeklyCaloriesDayConfig[];
}
