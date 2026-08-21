import { describe, expect, it } from 'vitest';
import { WorkoutExerciseSummary } from '../data-access/models/workout-storage.models';
import { getSuggestedWorkoutName } from './workout-plan-name.util';

function placement(targetMuscle: string, order: number): WorkoutExerciseSummary {
  return {
    id: `placement:${order}`,
    exerciseId: `exercise:${order}`,
    order,
    section: 'main',
    trackingType: 'weight-and-repetitions',
    name: targetMuscle,
    nameEn: targetMuscle,
    nameFa: targetMuscle,
    targetMuscle,
    sets: [],
  };
}

describe('getSuggestedWorkoutName', () => {
  it('names focused workouts from unique main muscles', () => {
    expect(
      getSuggestedWorkoutName(
        [placement('chest', 0), placement('chest', 1), placement('arms', 2)],
        (muscle) => muscle[0].toUpperCase() + muscle.slice(1),
        'Workout Day',
      ),
    ).toBe('Chest & Arms Workout');
  });

  it('uses full body for more than two main muscle groups', () => {
    expect(
      getSuggestedWorkoutName(
        [placement('chest', 0), placement('back', 1), placement('legs', 2)],
        (muscle) => muscle,
        'Workout Day',
      ),
    ).toBe('Full Body Workout');
  });
});
