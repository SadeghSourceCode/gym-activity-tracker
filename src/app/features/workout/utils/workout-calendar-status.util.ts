import { Workout } from '../data-access/models/workout-storage.models';
import { isWorkoutOnDate } from './weekly-recurrence.util';

export type WorkoutCalendarDayStatus = 'completed' | 'rest' | 'missed' | 'planned' | 'none';

export function resolveWorkoutCalendarDayStatus(
  dateKey: string,
  today: string,
  workouts: readonly Workout[],
  restDayKeys: ReadonlySet<string>,
): WorkoutCalendarDayStatus {
  if (restDayKeys.has(dateKey)) {
    return 'rest';
  }

  const scheduledWorkouts = workouts.filter((workout) => isWorkoutOnDate(workout, dateKey));
  if (!scheduledWorkouts.length) {
    return 'none';
  }
  if (scheduledWorkouts.every((workout) => workout.completionStatus === 'completed')) {
    return 'completed';
  }

  return dateKey < today ? 'missed' : 'planned';
}
