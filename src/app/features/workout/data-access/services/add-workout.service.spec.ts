import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { Exercise } from '../../../exercise-library/data-access/models/exercise.models';
import { ExerciseLibraryService } from '../../../exercise-library/data-access/services/exercise-library.service';
import { AddWorkoutService } from './add-workout.service';

const exercise: Exercise = {
  id: 'catalog:squat',
  name: 'Squat',
  nameEn: 'Squat',
  nameFa: 'اسکوات',
  aliases: [],
  difficulty: 'beginner',
  equipment: ['body weight'],
  primaryMuscles: ['quadriceps'],
  secondaryMuscles: ['glutes'],
  instructions: ['Squat with a neutral spine.'],
  media: [],
  trackingType: 'repetitions',
  category: 'strength',
  targetMuscle: 'legs',
  source: 'catalog',
  sourceId: 'squat',
  license: { name: 'Example', attributionRequired: false },
  provenance: { dataset: 'catalog', transformations: [] },
};

describe('AddWorkoutService exercise placement', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AddWorkoutService,
        {
          provide: ExerciseLibraryService,
          useValue: {
            getMediaUrl: () => null,
            getTargetMuscles: () => of([]),
            search: () => of({ items: [], total: 0 }),
          },
        },
      ],
    });
  });

  it('assigns section to the workout exercise instead of the library entity', () => {
    const service = TestBed.inject(AddWorkoutService);

    const selected = service.toggleExercise([], exercise, 'warmup');

    expect(selected[0].section).toBe('warmup');
    expect('section' in exercise).toBe(false);
  });

  it('creates an ordered reference with tracking-aware sets', () => {
    const service = TestBed.inject(AddWorkoutService);
    const selected = service.toggleExercise([], exercise, 'main');

    expect(selected[0]).toMatchObject({
      exerciseId: exercise.id,
      order: 0,
      section: 'main',
      trackingType: 'repetitions',
      sets: [{ id: 1, reps: 0, weightKg: 0 }],
    });
  });

  it('stores weekly recurrence as four explicit occurrences', () => {
    const service = TestBed.inject(AddWorkoutService);
    const selected = service.toggleExercise([], exercise, 'main');
    const workouts = service.createWorkout([], {
      workoutTitle: '',
      defaultWorkoutTitle: 'Leg Day',
      selectedDate: '2026-08-21',
      selectedExercises: selected,
      targetMuscle: 'legs',
      isWeeklyPlan: true,
    });

    expect(workouts[0].schemaVersion).toBe(2);
    expect(workouts[0].recurrence).toEqual({
      frequency: 'weekly',
      interval: 1,
      occurrences: 4,
    });
  });

  it('reorders placements and rewrites explicit order values', () => {
    const service = TestBed.inject(AddWorkoutService);
    const first = service.toggleExercise([], exercise, 'main');
    const secondExercise = { ...exercise, id: 'catalog:lunge', name: 'Lunge' };
    const selected = service.toggleExercise(first, secondExercise, 'main');

    const moved = service.moveExercise(selected, selected[1].id, -1);

    expect(moved.map(({ exerciseId, order }) => ({ exerciseId, order }))).toEqual([
      { exerciseId: 'catalog:lunge', order: 0 },
      { exerciseId: 'catalog:squat', order: 1 },
    ]);
  });
});
