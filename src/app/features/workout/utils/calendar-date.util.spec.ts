import {
  compareDateKeys,
  getDateKey,
  isDateKey,
  parseDateKey,
} from './calendar-date.util';

describe('calendar date utilities', () => {
  it('creates YYYY-MM-DD keys from local calendar dates', () => {
    expect(getDateKey(new Date(2026, 7, 3, 23, 59, 59))).toBe('2026-08-03');
  });

  it('parses a date key as a local calendar day', () => {
    const date = parseDateKey('2026-08-03');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(3);
  });

  it('compares date keys without using timestamp time parts', () => {
    expect(compareDateKeys('2026-08-02', '2026-08-03')).toBeLessThan(0);
    expect(compareDateKeys('2026-08-03', '2026-08-03')).toBe(0);
    expect(compareDateKeys('2026-08-04', '2026-08-03')).toBeGreaterThan(0);
  });

  it('rejects invalid date keys', () => {
    expect(isDateKey('2026-08-03')).toBe(true);
    expect(isDateKey('2026-8-3')).toBe(false);
    expect(isDateKey('2026-02-30')).toBe(false);
  });
});

