import { Workout } from './workout-storage.models';

export interface WorkoutCalendarConfig {
  selectedDate?: string;
  workouts?: readonly Workout[];
}
