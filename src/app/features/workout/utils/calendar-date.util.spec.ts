import {
  addMonths,
  compareDateKeys,
  daysBetweenDates,
  getDateKey,
  isDateKey,
  parseDateKey,
  startOfDay,
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

  it('normalizes a date to the start of its local day', () => {
    const result = startOfDay(new Date(2026, 7, 3, 14, 30, 45));

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(getDateKey(result)).toBe('2026-08-03');
  });

  it('adds months to a calendar date', () => {
    expect(getDateKey(addMonths(parseDateKey('2026-08-03'), 2))).toBe('2026-10-03');
    expect(getDateKey(addMonths(parseDateKey('2026-11-03'), 2))).toBe('2027-01-03');
  });

  it('counts calendar days between two dates', () => {
    expect(daysBetweenDates(parseDateKey('2026-08-03'), parseDateKey('2026-08-10'))).toBe(7);
    expect(daysBetweenDates(parseDateKey('2026-08-03'), parseDateKey('2026-08-03'))).toBe(0);
  });
});
