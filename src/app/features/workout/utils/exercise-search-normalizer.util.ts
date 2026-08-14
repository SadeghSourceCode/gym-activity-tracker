const arabicDiacriticsPattern = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

export function normalizeExerciseSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(arabicDiacriticsPattern, '')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ۀة]/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/إ|أ/g, 'ا')
    .replace(/ـ/g, '')
    .replace(/[\u200C\u200D]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
