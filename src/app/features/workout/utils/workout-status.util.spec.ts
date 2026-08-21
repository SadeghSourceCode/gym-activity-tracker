import { resolveWorkoutStatus } from './workout-status.util';

describe('resolveWorkoutStatus', () => {
  const today = '2026-08-03';

  it('returns upcoming for future workouts', () => {
    expect(resolveWorkoutStatus('2026-08-04', 'pending', today)).toBe('upcoming');
    expect(resolveWorkoutStatus('2026-08-04', 'completed', today)).toBe('upcoming');
    expect(resolveWorkoutStatus('2026-08-04', 'rejected', today)).toBe('upcoming');
  });

  it('returns upcoming until a workout is started today', () => {
    expect(resolveWorkoutStatus(today, 'pending', today)).toBe('upcoming');
    expect(resolveWorkoutStatus(today, 'pending', today, true)).toBe('in-progress');
  });

  it('returns done for a completed workout today', () => {
    expect(resolveWorkoutStatus(today, 'completed', today)).toBe('done');
  });

  it('returns rejected for a rejected workout today', () => {
    expect(resolveWorkoutStatus(today, 'rejected', today)).toBe('rejected');
  });

  it('returns done for a completed workout in the past', () => {
    expect(resolveWorkoutStatus('2026-08-02', 'completed', today)).toBe('done');
  });

  it('returns rejected for a pending workout in the past', () => {
    expect(resolveWorkoutStatus('2026-08-02', 'pending', today)).toBe('rejected');
  });

  it('returns rejected for a rejected workout in the past', () => {
    expect(resolveWorkoutStatus('2026-08-02', 'rejected', today)).toBe('rejected');
  });
});
