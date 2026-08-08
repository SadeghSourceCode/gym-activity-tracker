import { CopiedWorkoutClipboard, WorkoutExerciseSummary } from '../models/workout-storage.models';

export const copiedWorkoutStorageKey = 'gym-activity-tracker.copied-workout';

export function loadCopiedWorkout(): CopiedWorkoutClipboard | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const storedClipboard = localStorage.getItem(copiedWorkoutStorageKey);

    if (!storedClipboard) {
      return null;
    }

    const clipboard = JSON.parse(storedClipboard) as CopiedWorkoutClipboard;

    if (
      typeof clipboard?.name !== 'string' ||
      !Array.isArray(clipboard.exercises) ||
      !clipboard.exercises.length
    ) {
      return null;
    }

    return {
      name: clipboard.name,
      exercises: clipboard.exercises.filter(isValidWorkoutExercise),
    };
  } catch {
    return null;
  }
}

export function saveCopiedWorkout(clipboard: CopiedWorkoutClipboard): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(copiedWorkoutStorageKey, JSON.stringify(clipboard));
}

export function clearCopiedWorkout(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.removeItem(copiedWorkoutStorageKey);
}

function isValidWorkoutExercise(
  exercise: WorkoutExerciseSummary,
): exercise is WorkoutExerciseSummary {
  return (
    typeof exercise?.id === 'string' &&
    typeof exercise.name === 'string' &&
    typeof exercise.nameEn === 'string' &&
    typeof exercise.nameFa === 'string' &&
    Array.isArray(exercise.sets)
  );
}
