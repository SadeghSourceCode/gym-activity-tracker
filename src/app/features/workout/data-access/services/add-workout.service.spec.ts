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
  it('assigns section to the workout exercise instead of the library entity', () => {
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
    const service = TestBed.inject(AddWorkoutService);

    const selected = service.toggleExercise([], exercise, 'warmup');

    expect(selected[0].section).toBe('warmup');
    expect('section' in exercise).toBe(false);
  });
});
