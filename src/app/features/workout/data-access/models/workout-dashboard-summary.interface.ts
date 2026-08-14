export interface WorkoutDashboardDaySummary {
  dateKey: string;
  calories: number;
}

export interface WorkoutDashboardSummary {
  weeklyCalories: readonly WorkoutDashboardDaySummary[];
  selectedDayCalories: number;
  selectedDayDurationMinutes: number;
  selectedDayExerciseCount: number;
}
