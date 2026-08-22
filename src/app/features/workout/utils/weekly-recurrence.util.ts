import { Workout } from '../data-access/models/workout-storage.models';
import { daysBetweenDates, getDateKey, parseDateKey, startOfDay } from './calendar-date.util';

export const weeklyRecurrenceOccurrences = 4;

export function isWorkoutOnDate(workout: Workout, dateKey: string): boolean {
  if (getDateKey(workout.date) === dateKey) {
    return true;
  }

  const recurrence = getWorkoutRecurrence(workout);
  if (!recurrence) {
    return false;
  }

  const workoutStart = startOfDay(workout.date);
  const targetDate = startOfDay(parseDateKey(dateKey));

  const dayDifference = daysBetweenDates(workoutStart, targetDate);
  if (dayDifference <= 0 || dayDifference % (7 * recurrence.interval) !== 0) {
    return false;
  }

  return dayDifference / (7 * recurrence.interval) < recurrence.occurrences;
}

export function canStartWorkoutOnDate(
  workout: Workout,
  dateKey: string,
  todayDateKey: string,
): boolean {
  return dateKey >= todayDateKey && isWorkoutOnDate(workout, dateKey);
}

export function getWeeklyRecurrenceEnd(workout: Workout): Date | null {
  const recurrence = getWorkoutRecurrence(workout);
  if (!recurrence) {
    return null;
  }

  const end = startOfDay(workout.date);
  end.setDate(end.getDate() + 7 * recurrence.interval * (recurrence.occurrences - 1));
  return end;
}

function getWorkoutRecurrence(workout: Workout) {
  if (workout.recurrence?.frequency === 'weekly') return workout.recurrence;
  return workout.isWeeklyPlan
    ? { frequency: 'weekly' as const, interval: 1, occurrences: weeklyRecurrenceOccurrences }
    : null;
}
