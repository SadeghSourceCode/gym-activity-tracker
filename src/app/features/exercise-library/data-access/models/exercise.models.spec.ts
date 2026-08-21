import { describe, expect, it } from 'vitest';
import { Exercise, getExerciseMediaPath } from './exercise.models';

const exercise: Exercise = {
  id: 'catalog:bench-press',
  name: 'Bench press',
  nameEn: 'Bench press',
  nameFa: 'پرس سینه',
  aliases: ['barbell bench press'],
  difficulty: 'intermediate',
  equipment: ['barbell', 'bench'],
  primaryMuscles: ['pectorals'],
  secondaryMuscles: ['triceps'],
  instructions: ['Lie on the bench.', 'Press the bar upward.'],
  media: [
    { id: 'bench:image', kind: 'image', role: 'thumbnail', url: 'bench.jpg' },
    { id: 'bench:animation', kind: 'animation', role: 'instructional', url: 'bench.gif' },
  ],
  trackingType: 'weight-and-repetitions',
  category: 'strength',
  targetMuscle: 'chest',
  source: 'catalog',
  sourceId: 'bench-press',
  license: { name: 'Example', attributionRequired: false },
  provenance: { dataset: 'catalog', transformations: [] },
};

describe('Exercise domain contract', () => {
  it('prefers instructional animation for display', () => {
    expect(getExerciseMediaPath(exercise)).toBe('bench.gif');
  });

  it('keeps workout section outside the exercise entity', () => {
    expect('section' in exercise).toBe(false);
  });
});
