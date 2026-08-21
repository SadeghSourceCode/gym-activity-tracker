export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'unknown';

export type ExerciseTrackingType =
  | 'repetitions'
  | 'weight-and-repetitions'
  | 'duration'
  | 'distance-and-duration'
  | 'assisted-weight-and-repetitions';

export type ExerciseMediaKind = 'image' | 'animation' | 'video';

export type ExerciseMediaRole = 'thumbnail' | 'preview' | 'instructional';

export interface ExerciseMediaAsset {
  id: string;
  kind: ExerciseMediaKind;
  role: ExerciseMediaRole;
  url: string;
  mimeType?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  posterUrl?: string;
  alt?: string;
  attribution?: string;
}

export interface ExerciseLicense {
  name: string;
  spdxId?: string;
  url?: string;
  attributionRequired: boolean;
}

export interface ExerciseProvenance {
  dataset: string;
  datasetVersion?: string;
  importedAt?: string;
  originalAttribution?: string;
  transformations: readonly string[];
}

/**
 * Canonical exercise-library entity. Workout placement (warmup/main/cooldown)
 * intentionally belongs to WorkoutExercise and must never be added here.
 */
export interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  nameFa: string;
  aliases: readonly string[];
  difficulty: ExerciseDifficulty;
  equipment: readonly string[];
  primaryMuscles: readonly string[];
  secondaryMuscles: readonly string[];
  instructions: readonly string[];
  media: readonly ExerciseMediaAsset[];
  trackingType: ExerciseTrackingType;
  category: string;
  targetMuscle: string;
  source: string;
  sourceId: string;
  license: ExerciseLicense;
  provenance: ExerciseProvenance;
}

export interface ExerciseSearchQuery {
  text?: string;
  offset?: number;
  limit?: number;
  targetMuscle?: string | null;
  equipment?: string | null;
  difficulty?: ExerciseDifficulty | null;
  trackingType?: ExerciseTrackingType | null;
}

export interface ExerciseSearchResult {
  items: Exercise[];
  total: number;
}

export interface TargetMuscleOption {
  id: string;
  label: string;
  mainMuscles: string;
  imageUrl: string;
  exerciseCount: number;
}

export function getExerciseMediaPath(exercise: Exercise): string | null {
  return (
    (
      exercise.media.find((asset) => asset.kind === 'animation') ??
      exercise.media.find((asset) => asset.kind === 'image') ??
      exercise.media[0]
    )?.url ?? null
  );
}
