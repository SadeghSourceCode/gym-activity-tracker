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
    expect(completed.session).toMatchObject({
      status: 'completed',
      completedAt: '2026-08-21T10:30:00.000Z',
      durationSeconds: 1800,
      progressPercent: 100,
    });
  });

  it('does not restart an already active session', () => {
    const started = startWorkoutSession(workout(), new Date('2026-08-21T10:00:00Z'));
    const startedAgain = startWorkoutSession(started, new Date('2026-08-21T10:10:00Z'));

    expect(startedAgain).toBe(started);
    expect(startedAgain.session?.startedAt).toBe('2026-08-21T10:00:00.000Z');
  });

  it('reports completed set progress', () => {
    expect(getWorkoutSessionProgress(workout())).toEqual({ completedSets: 1, totalSets: 2 });
    expect(getWorkoutProgressPercent(workout())).toBe(50);
    expect(
      syncWorkoutSessionProgress(startWorkoutSession(workout())).session?.progressPercent,
    ).toBe(50);
  });

  it('keeps actual progress when a workout is abandoned', () => {
    const started = startWorkoutSession(workout(), new Date('2026-08-21T10:00:00Z'));
    const abandoned = finishWorkoutSession(started, 'abandoned', new Date('2026-08-21T10:12:00Z'));

    expect(abandoned.completionStatus).toBe('rejected');
    expect(abandoned.session).toMatchObject({
      status: 'abandoned',
      completedAt: '2026-08-21T10:12:00.000Z',
      durationSeconds: 720,
      progressPercent: 50,
    });
  });
});
