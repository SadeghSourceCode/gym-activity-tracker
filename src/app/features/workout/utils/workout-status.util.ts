import {
  WorkoutCompletionStatus,
  WorkoutDisplayStatus,
} from '../data-access/models/workout-planner.models';
import { compareDateKeys } from './calendar-date.util';

export const WORKOUT_STATUS_LABELS = {
  'in-progress': 'In Progress',
  done: 'Done',
  rejected: 'Rejected',
  upcoming: 'Incoming',
} satisfies Record<WorkoutDisplayStatus, string>;

export function resolveWorkoutStatus(
  workoutDate: string,
  completionStatus: WorkoutCompletionStatus,
  today: string,
  sessionActive = false,
): WorkoutDisplayStatus {
  const dateComparison = compareDateKeys(workoutDate, today);

  if (dateComparison > 0) {
    return 'upcoming';
  }

  if (completionStatus === 'completed') {
    return 'done';
  }

  if (completionStatus === 'rejected') {
    return 'rejected';
  }

  return dateComparison === 0 ? (sessionActive ? 'in-progress' : 'upcoming') : 'rejected';
}
