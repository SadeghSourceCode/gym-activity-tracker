export interface WorkoutPlanningExerciseConfig {
  id: string;
  name: string;
  setCount: number;
}

export interface WorkoutPlanningStepConfig {
  workoutTitle?: string;
  defaultWorkoutTitle: string;
  isWeeklyPlan?: boolean;
  exercises: readonly WorkoutPlanningExerciseConfig[];
  workoutTitleLabel: string;
  leaveEmptyToUseLabel: string;
  weeklyPlanLabel: string;
  weeklyPlanHelpLabel: string;
  selectedExercisesLabel: string;
  setsLabel?: string;
}
