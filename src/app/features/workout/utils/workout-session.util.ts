import { Workout, WorkoutSessionStatus } from '../data-access/models/workout-storage.models';

export interface WorkoutSessionProgress {
  completedSets: number;
  totalSets: number;
}

export function startWorkoutSession(workout: Workout, now = new Date()): Workout {
  if (workout.session?.status === 'active') {
    return workout;
  }

  const timestamp = now.toISOString();
  return {
    ...workout,
    completionStatus: 'pending',
    session: { status: 'active', startedAt: timestamp, lastUpdatedAt: timestamp },
  };
}

export function touchWorkoutSession(workout: Workout, now = new Date()): Workout {
  if (workout.session?.status !== 'active') {
    return workout;
  }

  return { ...workout, session: { ...workout.session, lastUpdatedAt: now.toISOString() } };
}

export function finishWorkoutSession(
  workout: Workout,
  status: Extract<WorkoutSessionStatus, 'completed' | 'abandoned'>,
  now = new Date(),
): Workout {
  if (workout.session?.status !== 'active') {
    return workout;
  }

  const completedAt = now.toISOString();
  const durationSeconds = Math.max(
    0,
    Math.floor((now.getTime() - new Date(workout.session.startedAt).getTime()) / 1000),
  );

  return {
    ...workout,
    completionStatus: status === 'completed' ? 'completed' : 'rejected',
    session: {
      ...workout.session,
      status,
      lastUpdatedAt: completedAt,
      completedAt,
      durationSeconds,
    },
  };
}

export function getWorkoutSessionProgress(workout: Workout): WorkoutSessionProgress {
  const sets = workout.exercises.flatMap((exercise) => exercise.sets);
  return {
    completedSets: sets.filter((set) => set.completed).length,
    totalSets: sets.length,
  };
}
