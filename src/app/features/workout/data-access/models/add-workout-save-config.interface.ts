import { WorkoutExerciseSummary } from '../../models/workout-storage.models';

export interface AddWorkoutSaveConfig {
  workoutTitle: string;
  defaultWorkoutTitle: string;
  selectedDate: string;
  selectedExercises: WorkoutExerciseSummary[];
  targetMuscle: string;
  isWeeklyPlan: boolean;
}
