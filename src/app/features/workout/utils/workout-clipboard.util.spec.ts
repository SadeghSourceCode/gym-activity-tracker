import { CopiedWorkoutClipboard } from '../data-access/models/workout-storage.models';
import {
  clearCopiedWorkout,
  copiedWorkoutStorageKey,
  copiedWorkoutTextHeader,
  loadCopiedWorkout,
  parseCopiedWorkoutText,
  saveCopiedWorkout,
  serializeCopiedWorkout,
} from './workout-clipboard.util';

describe('workout clipboard utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty when nothing has been copied', () => {
    expect(loadCopiedWorkout()).toEqual({ status: 'empty' });
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
          sets: [
            { id: 1, repeat: 10, weight: 60 },
            { id: 2, repeat: 8, weight: 65 },
          ],
        },
        {
          id: 'squat',
          name: 'Squat',
          nameEn: 'Squat',
          nameFa: 'اسکات',
          targetMuscle: 'legs',
          thumbnailUrl: '/gifs/squat.gif',
          sets: [{ id: 1, repeat: 5, weight: 80 }],
        },
      ],
    };

    saveCopiedWorkout(clipboard);

    expect(loadCopiedWorkout()).toEqual({ status: 'ok', clipboard });
  });

  it('stores the workout as text with a schema header', () => {
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

    const storedText = localStorage.getItem(copiedWorkoutStorageKey);
    expect(storedText?.split('\n')[0]).toBe(copiedWorkoutTextHeader);
    expect(parseCopiedWorkoutText(storedText as string)).toEqual(clipboard);
  });

  it('removes the copied workout when cleared', () => {
    saveCopiedWorkout({
      name: 'Chest Day',
      exercises: [
        {
          id: 'bench-press',
          name: 'Bench Press',
          nameEn: 'Bench Press',
          nameFa: 'پرس سینه',
          sets: [{ id: 1, repeat: 10, weight: 60 }],
        },
      ],
    });
    clearCopiedWorkout();

    expect(localStorage.getItem(copiedWorkoutStorageKey)).toBeNull();
    expect(loadCopiedWorkout()).toEqual({ status: 'empty' });
  });

  it('returns invalid for broken schema stored data', () => {
    localStorage.setItem(copiedWorkoutStorageKey, 'not-a-workout');
    expect(loadCopiedWorkout()).toEqual({ status: 'invalid' });

    localStorage.setItem(copiedWorkoutStorageKey, 'GAT-WORKOUT:1');
    expect(loadCopiedWorkout()).toEqual({ status: 'invalid' });

    localStorage.setItem(copiedWorkoutStorageKey, 'GAT-WORKOUT:1\nname: Chest Day');
    expect(loadCopiedWorkout()).toEqual({ status: 'invalid' });

    localStorage.setItem(
      copiedWorkoutStorageKey,
      'GAT-WORKOUT:2\nname: Chest Day\nexercise:bench-press|Bench Press|پرس سینه|chest|/gifs/bench-press.gif',
    );
    expect(loadCopiedWorkout()).toEqual({ status: 'invalid' });
  });

  it('returns null for malformed copied text', () => {
    expect(parseCopiedWorkoutText('')).toBeNull();
    expect(parseCopiedWorkoutText('random text')).toBeNull();
    expect(parseCopiedWorkoutText('GAT-WORKOUT:1\nname:')).toBeNull();
    expect(parseCopiedWorkoutText('GAT-WORKOUT:1\nname: Chest Day\nexercise:only-id')).toBeNull();
    expect(
      parseCopiedWorkoutText('GAT-WORKOUT:1\nname: Chest Day\nset:1|2'),
    ).toBeNull();
    expect(
      parseCopiedWorkoutText(
        'GAT-WORKOUT:1\nname: Chest Day\nexercise:bench-press|Bench Press|پرس سینه|chest|/gifs/bench-press.gif\nset:ten|sixty',
      ),
    ).toBeNull();
  });

  it('round-trips copied text through serialize and parse', () => {
    const clipboard: CopiedWorkoutClipboard = {
      name: 'Leg Day',
      exercises: [
        {
          id: 'squat',
          name: 'Squat',
          nameEn: 'Squat',
          nameFa: 'اسکات',
          targetMuscle: 'legs',
          thumbnailUrl: '/gifs/squat.gif',
          sets: [{ id: 1, repeat: 5, weight: 80 }],
        },
      ],
    };

    const text = serializeCopiedWorkout(clipboard);

    expect(parseCopiedWorkoutText(text)).toEqual(clipboard);
  });
});
