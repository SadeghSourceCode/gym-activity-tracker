import { CopiedWorkoutClipboard } from '../models/workout-storage.models';
import {
  clearCopiedWorkout,
  copiedWorkoutStorageKey,
  loadCopiedWorkout,
  saveCopiedWorkout,
} from './workout-clipboard.util';

describe('workout clipboard utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when nothing has been copied', () => {
    expect(loadCopiedWorkout()).toBeNull();
  });

  it('saves and loads a copied workout', () => {
    const clipboard: CopiedWorkoutClipboard = {
      name: 'Chest Day',
      exercises: [
        {
          id: 'bench-press',
          name: 'Bench Press',
          nameEn: 'Bench Press',
          nameFa: 'پرس سینه',
          targetMuscle: 'chest',
          thumbnailUrl: '/gifs/bench-press.gif',
          sets: [{ id: 1, repeat: 10, weight: 60 }],
        },
      ],
    };

    saveCopiedWorkout(clipboard);

    expect(localStorage.getItem(copiedWorkoutStorageKey)).toBe(JSON.stringify(clipboard));
    expect(loadCopiedWorkout()).toEqual(clipboard);
  });

  it('removes the copied workout when cleared', () => {
    saveCopiedWorkout({ name: 'Chest Day', exercises: [] });
    clearCopiedWorkout();

    expect(localStorage.getItem(copiedWorkoutStorageKey)).toBeNull();
    expect(loadCopiedWorkout()).toBeNull();
  });

  it('returns null for malformed stored data', () => {
    localStorage.setItem(copiedWorkoutStorageKey, 'not-json');
    expect(loadCopiedWorkout()).toBeNull();

    localStorage.setItem(copiedWorkoutStorageKey, JSON.stringify({ name: 'Chest Day' }));
    expect(loadCopiedWorkout()).toBeNull();

    localStorage.setItem(copiedWorkoutStorageKey, JSON.stringify({ name: 'Chest Day', exercises: [] }));
    expect(loadCopiedWorkout()).toBeNull();
  });
});
