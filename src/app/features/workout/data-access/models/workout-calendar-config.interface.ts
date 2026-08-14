import { Workout } from '../../models/workout-storage.models';

export interface WorkoutCalendarConfig {
  selectedDate?: string;
  workouts?: readonly Workout[];
}
