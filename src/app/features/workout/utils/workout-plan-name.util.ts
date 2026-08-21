import { WorkoutExerciseSummary } from '../data-access/models/workout-storage.models';

export function getSuggestedWorkoutName(
  exercises: readonly WorkoutExerciseSummary[],
  muscleLabel: (muscle: string) => string,
  fallback: string,
  workoutSuffix = 'Workout',
  fullBodyTitle = 'Full Body Workout',
): string {
  const muscles = [
    ...new Set(
      exercises
        .filter((exercise) => exercise.section === 'main')
        .map((exercise) => exercise.targetMuscle)
        .filter((muscle): muscle is string => Boolean(muscle)),
    ),
  ];

  if (!muscles.length) return fallback;
  if (muscles.length > 2) return fullBodyTitle;
  return `${muscles.map(muscleLabel).join(' & ')} ${workoutSuffix}`;
}
