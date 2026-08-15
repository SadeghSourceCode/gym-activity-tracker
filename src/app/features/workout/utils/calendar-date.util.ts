const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  return getDateKey(new Date());
}

export function parseDateKey(dateKey: string): Date {
  assertDateKey(dateKey);

  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function compareDateKeys(leftDateKey: string, rightDateKey: string): number {
  assertDateKey(leftDateKey);
  assertDateKey(rightDateKey);

  return leftDateKey.localeCompare(rightDateKey);
}

export function isDateKey(value: string): boolean {
  if (!dateKeyPattern.test(value)) {
    return false;
  }

  const date = parseDateKeyParts(value);

  return getDateKey(date) === value;
}

export function startOfDay(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

export function addMonths(date: Date, months: number): Date {
  const nextDate = startOfDay(date);

  return new Date(nextDate.getFullYear(), nextDate.getMonth() + months, nextDate.getDate());
}

export function daysBetweenDates(leftDate: Date, rightDate: Date): number {
  const left = startOfDay(leftDate).getTime();
  const right = startOfDay(rightDate).getTime();

  return Math.round((right - left) / 86_400_000);
}

function assertDateKey(value: string): void {
  if (!isDateKey(value)) {
    throw new Error(`Invalid calendar date key: ${value}`);
  }
}

function parseDateKeyParts(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}
