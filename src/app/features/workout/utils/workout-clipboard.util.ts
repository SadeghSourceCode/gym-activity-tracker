import {
  CopiedWorkoutClipboard,
  WorkoutExerciseSummary,
} from '../data-access/models/workout-storage.models';

export const copiedWorkoutStorageKey = 'gym-activity-tracker.copied-workout';
export const copiedWorkoutTextHeader = 'GAT-WORKOUT:1';

export type CopiedWorkoutLoadResult =
  { status: 'empty' } | { status: 'invalid' } | { status: 'ok'; clipboard: CopiedWorkoutClipboard };

export function loadCopiedWorkout(): CopiedWorkoutLoadResult {
  if (typeof localStorage === 'undefined') {
    return { status: 'empty' };
  }

  try {
    const storedText = localStorage.getItem(copiedWorkoutStorageKey);

    if (!storedText) {
      return { status: 'empty' };
    }

    const clipboard = parseCopiedWorkoutText(storedText);

    return clipboard ? { status: 'ok', clipboard } : { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}

export function saveCopiedWorkout(clipboard: CopiedWorkoutClipboard): void {
  const text = serializeCopiedWorkout(clipboard);

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(copiedWorkoutStorageKey, text);
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    void navigator.clipboard.writeText(text).catch(() => undefined);
  }
}

export function clearCopiedWorkout(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(copiedWorkoutStorageKey);
  }
}

export async function readCopiedWorkoutFromSystemClipboard(): Promise<CopiedWorkoutLoadResult> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
    return { status: 'empty' };
  }

  try {
    const text = await navigator.clipboard.readText();
    const clipboard = parseCopiedWorkoutText(text);

    return clipboard ? { status: 'ok', clipboard } : { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}

export function serializeCopiedWorkout(clipboard: CopiedWorkoutClipboard): string {
  const lines = [copiedWorkoutTextHeader, `name:${escapeField(clipboard.name)}`];

  for (const exercise of clipboard.exercises) {
    lines.push(
      `exercise:${escapeField(exercise.id)}|${escapeField(exercise.name)}|${escapeField(exercise.nameEn)}|${escapeField(exercise.nameFa)}|${escapeField(exercise.targetMuscle ?? '')}|${escapeField(exercise.thumbnailUrl ?? '')}`,
    );

    for (const set of exercise.sets) {
      lines.push(`set:${set.reps ?? 0}|${set.weightKg ?? 0}`);
    }
  }

  return lines.join('\n');
}

export function parseCopiedWorkoutText(text: string): CopiedWorkoutClipboard | null {
  if (typeof text !== 'string' || !text.trim()) {
    return null;
  }

  const lines = text.split(/\r?\n/);

  if (lines[0]?.trim() !== copiedWorkoutTextHeader) {
    return null;
  }

  let name = '';
  let sawName = false;
  const exercises: WorkoutExerciseSummary[] = [];
  let currentExercise: WorkoutExerciseSummary | undefined;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      continue;
    }

    if (line.startsWith('name:')) {
      if (sawName || exercises.length) {
        return null;
      }

      name = unescapeField(line.slice('name:'.length));
      sawName = true;
      continue;
    }

    if (line.startsWith('exercise:')) {
      const fields = splitEscaped(line.slice('exercise:'.length));

      if (fields.length !== 6) {
        return null;
      }

      const [id, exerciseName, nameEn, nameFa, targetMuscle, thumbnailUrl] = fields;

      if (!id || !exerciseName) {
        return null;
      }

      currentExercise = {
        id: unescapeField(id),
        exerciseId: unescapeField(id),
        order: exercises.length,
        section: 'main',
        trackingType: 'weight-and-repetitions',
        name: unescapeField(exerciseName),
        nameEn: unescapeField(nameEn),
        nameFa: unescapeField(nameFa),
        targetMuscle: unescapeField(targetMuscle) || undefined,
        thumbnailUrl: unescapeField(thumbnailUrl) || undefined,
        sets: [],
      };
      exercises.push(currentExercise);
      continue;
    }

    if (line.startsWith('set:') && currentExercise) {
      const [repeatRaw, weightRaw] = line.slice('set:'.length).split('|');
      const repeat = Number(repeatRaw);
      const weight = Number(weightRaw);

      if (!Number.isFinite(repeat) || !Number.isFinite(weight)) {
        return null;
      }

      currentExercise.sets.push({
        id: currentExercise.sets.length + 1,
        reps: repeat,
        weightKg: weight,
      });
      continue;
    }

    return null;
  }

  if (!sawName || !exercises.length) {
    return null;
  }

  return { name, exercises };
}

function escapeField(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}

function unescapeField(value: string): string {
  let result = '';

  for (let i = 0; i < value.length; i++) {
    const char = value[i];

    if (char === '\\' && i + 1 < value.length) {
      const next = value[i + 1];

      if (next === 'n') {
        result += '\n';
        i++;
      } else if (next === 'r') {
        result += '\r';
        i++;
      } else if (next === '|') {
        result += '|';
        i++;
      } else if (next === '\\') {
        result += '\\';
        i++;
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }

  return result;
}

function splitEscaped(value: string): string[] {
  const fields: string[] = [];
  let current = '';
  let escaped = false;

  for (const char of value) {
    if (escaped) {
      current += char;
      escaped = false;
    } else if (char === '\\') {
      current += char;
      escaped = true;
    } else if (char === '|') {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}
