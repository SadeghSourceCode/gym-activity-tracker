import { WorkoutRecurrence } from './workout-storage.models';

export interface WorkoutPlanningChangedOutput {
  workoutTitle?: string;
  recurrenceFrequency?: WorkoutRecurrence['frequency'] | null;
}
