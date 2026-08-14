import { describe, expect, it } from 'vitest';
import { normalizeExerciseSearchText } from './exercise-search-normalizer.util';

describe('normalizeExerciseSearchText', () => {
  it('normalizes Arabic letter variants to Persian forms', () => {
    expect(normalizeExerciseSearchText('پرس سينه با دمبل')).toBe('پرس سینه با دمبل');
    expect(normalizeExerciseSearchText('حركت كششي')).toBe('حرکت کششی');
  });

  it('removes Arabic diacritics and normalizes spacing', () => {
    expect(normalizeExerciseSearchText('  پِرِس\u200Cسینه  ')).toBe('پرس سینه');
  });
});
