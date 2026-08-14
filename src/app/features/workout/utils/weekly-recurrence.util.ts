
import { Workout } from '../data-access/models/workout-storage.models';
import {
  addMonths,
  daysBetweenDates,
  getDateKey,
  parseDateKey,
  startOfDay,
} from './calendar-date.util';

export const weeklyRecurrenceMonths = 2;

export function isWorkoutOnDate(workout: Workout, dateKey: string): boolean {
  if (getDateKey(workout.date) === dateKey) {
    return true;
  }

  if (!workout.isWeeklyPlan) {
    return false;
  }

  const workoutStart = startOfDay(workout.date);
  const targetDate = startOfDay(parseDateKey(dateKey));

  if (
    targetDate <= workoutStart ||
    targetDate > addMonths(workoutStart, weeklyRecurrenceMonths)
  ) {
    return false;
  }

  return daysBetweenDates(workoutStart, targetDate) % 7 === 0;
}

export function getWeeklyRecurrenceEnd(workout: Workout): Date | null {
  if (!workout.isWeeklyPlan) {
    return null;
  }

  return addMonths(startOfDay(workout.date), weeklyRecurrenceMonths);
}
