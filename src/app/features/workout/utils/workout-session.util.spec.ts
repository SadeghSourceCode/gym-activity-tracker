import { describe, expect, it } from 'vitest';
import { Workout } from '../data-access/models/workout-storage.models';
import {
  finishWorkoutSession,
  getWorkoutSessionProgress,
  getWorkoutProgressPercent,
  startWorkoutSession,
  touchWorkoutSession,
  syncWorkoutSessionProgress,
} from './workout-session.util';

const workout = (): Workout => ({
  id: 1,
  schemaVersion: 2,
  name: 'Push',
  date: new Date('2026-08-21'),
  completionStatus: 'pending',
  sets: [],
  exercises: [
    {
      id: 'placement:1',
      exerciseId: 'exercise:1',
      order: 0,
      section: 'main',
      trackingType: 'weight-and-repetitions',
      name: 'Press',
      nameEn: 'Press',
      nameFa: 'پرس',
      sets: [{ id: 1, completed: true }, { id: 2 }],
    },
  ],
});

describe('workout session', () => {
  it('starts, touches, and completes a resumable session', () => {
    const started = startWorkoutSession(workout(), new Date('2026-08-21T10:00:00Z'));
    const touched = touchWorkoutSession(started, new Date('2026-08-21T10:05:00Z'));
    const completed = finishWorkoutSession(touched, 'completed', new Date('2026-08-21T10:30:00Z'));

    expect(touched.session?.lastUpdatedAt).toBe('2026-08-21T10:05:00.000Z');
    expect(completed.completionStatus).toBe('completed');
    expect(completed.session).toMatchObject({ status: 'completed', durationSeconds: 1800 });
  });

  it('reports completed set progress', () => {
    expect(getWorkoutSessionProgress(workout())).toEqual({ completedSets: 1, totalSets: 2 });
    expect(getWorkoutProgressPercent(workout())).toBe(50);
    expect(
      syncWorkoutSessionProgress(startWorkoutSession(workout())).session?.progressPercent,
    ).toBe(50);
  });
});
