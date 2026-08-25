import { Workout } from '../data-access/models/workout-storage.models';
import {
  canStartWorkoutOnDate,
  getWeeklyRecurrenceEnd,
  isWorkoutOnDate,
  weeklyRecurrenceOccurrences,
} from './weekly-recurrence.util';

function createWorkout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 1,
    schemaVersion: 2,
    name: 'Chest Day',
    date: new Date(2026, 7, 3),
    exercises: [],
    sets: [],
    ...overrides,
  };
}

describe('weekly recurrence utilities', () => {
  it('matches a workout on its original date', () => {
    const workout = createWorkout();

    expect(isWorkoutOnDate(workout, '2026-08-03')).toBe(true);
  });

  it('does not match other dates for non-weekly workouts', () => {
    const workout = createWorkout();

    expect(isWorkoutOnDate(workout, '2026-08-04')).toBe(false);
    expect(isWorkoutOnDate(workout, '2026-08-10')).toBe(false);
  });

  it('matches weekly workouts every 7 days', () => {
    const workout = createWorkout({
      recurrence: { frequency: 'weekly', interval: 1, occurrences: 4 },
    });

    expect(isWorkoutOnDate(workout, '2026-08-10')).toBe(true);
    expect(isWorkoutOnDate(workout, '2026-08-17')).toBe(true);
  });

  it('does not match other weekdays for weekly workouts', () => {
    const workout = createWorkout({
      recurrence: { frequency: 'weekly', interval: 1, occurrences: 4 },
    });

    expect(isWorkoutOnDate(workout, '2026-08-04')).toBe(false);
    expect(isWorkoutOnDate(workout, '2026-08-11')).toBe(false);
  });

  it('matches monthly workouts on the same day of month', () => {
    const workout = createWorkout({
      recurrence: { frequency: 'monthly', interval: 1, occurrences: 4 },
    });

    expect(isWorkoutOnDate(workout, '2026-09-03')).toBe(true);
    expect(isWorkoutOnDate(workout, '2026-09-04')).toBe(false);
  });

  it('does not match weekly workouts before their start date', () => {
    const workout = createWorkout({
      recurrence: { frequency: 'weekly', interval: 1, occurrences: 4 },
    });

    expect(isWorkoutOnDate(workout, '2026-07-27')).toBe(false);
  });

  it(`limits weekly workouts to ${weeklyRecurrenceOccurrences} occurrences`, () => {
    const workout = createWorkout({
      recurrence: { frequency: 'weekly', interval: 1, occurrences: 4 },
    });

    expect(isWorkoutOnDate(workout, '2026-08-24')).toBe(true);
    expect(isWorkoutOnDate(workout, '2026-08-31')).toBe(false);
  });

  it('returns the recurrence end for weekly workouts only', () => {
    const weeklyWorkout = createWorkout({
      recurrence: { frequency: 'weekly', interval: 1, occurrences: 4 },
    });
    const regularWorkout = createWorkout();

    expect(getWeeklyRecurrenceEnd(weeklyWorkout)).toEqual(new Date(2026, 7, 24));
    expect(getWeeklyRecurrenceEnd(regularWorkout)).toBeNull();
  });

  it('allows starting the current occurrence when the recurring plan began in the past', () => {
    const workout = createWorkout({
      date: new Date(2026, 7, 8),
      recurrence: { frequency: 'weekly', interval: 1, occurrences: 4 },
    });

    expect(canStartWorkoutOnDate(workout, '2026-08-22', '2026-08-22')).toBe(true);
  });

  it('does not allow starting a past or unrelated occurrence', () => {
    const workout = createWorkout({
      date: new Date(2026, 7, 8),
      recurrence: { frequency: 'weekly', interval: 1, occurrences: 4 },
    });

    expect(canStartWorkoutOnDate(workout, '2026-08-15', '2026-08-22')).toBe(false);
    expect(canStartWorkoutOnDate(workout, '2026-08-23', '2026-08-22')).toBe(false);
  });
});
