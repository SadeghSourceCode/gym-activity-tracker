import { describe, expect, it } from 'vitest';
import { Workout } from '../data-access/models/workout-storage.models';
import { resolveWorkoutCalendarDayStatus } from './workout-calendar-status.util';

const workout = (completionStatus: Workout['completionStatus'] = 'pending'): Workout => ({
  id: 1,
  schemaVersion: 2,
  name: 'Workout',
  exercises: [],
  sets: [],
  date: new Date(2026, 7, 20),
  completionStatus,
});

describe('resolveWorkoutCalendarDayStatus', () => {
  const today = '2026-08-21';

  it('marks a fully completed workout day as completed', () => {
    expect(
      resolveWorkoutCalendarDayStatus(
        '2026-08-20',
        today,
        [workout('completed')],
        new Set(),
      ),
    ).toBe('completed');
  });

  it('gives an explicitly marked rest day priority', () => {
    expect(
      resolveWorkoutCalendarDayStatus(
        '2026-08-20',
        today,
        [workout('pending')],
        new Set(['2026-08-20']),
      ),
    ).toBe('rest');
  });

  it('marks an incomplete past workout as missed', () => {
    expect(
      resolveWorkoutCalendarDayStatus('2026-08-20', today, [workout()], new Set()),
    ).toBe('missed');
  });

  it('keeps current and future workout days planned', () => {
    const futureWorkout = { ...workout(), date: new Date(2026, 7, 22) };

    expect(
      resolveWorkoutCalendarDayStatus('2026-08-22', today, [futureWorkout], new Set()),
    ).toBe('planned');
  });
});
