import { WorkoutRecurrence } from './workout-storage.models';

export interface WorkoutPlanningExerciseConfig {
  id: string;
  name: string;
  setCount: number;
}

export interface WorkoutPlanningStepConfig {
  workoutTitle?: string;
  defaultWorkoutTitle: string;
  recurrenceFrequency?: WorkoutRecurrence['frequency'];
  exercises: readonly WorkoutPlanningExerciseConfig[];
  workoutTitleLabel: string;
  leaveEmptyToUseLabel: string;
  weeklyPlanLabel: string;
  weeklyPlanHelpLabel: string;
  monthlyPlanLabel: string;
  noRecurrenceLabel: string;
  selectedExercisesLabel: string;
  setsLabel?: string;
  removeLabel: string;
  reorderLabel: string;
}
