import { WorkoutCompletionStatus } from './workout-planner.models';
import { ExerciseTrackingType } from '../../../exercise-library/data-access/models/exercise.models';

export interface WorkoutSet {
  id: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  assistanceWeightKg?: number;
  restSeconds?: number;
  completed?: boolean;
  completedAt?: string;
}

export type WorkoutSessionStatus = 'active' | 'completed' | 'abandoned';

export interface WorkoutSession {
  status: WorkoutSessionStatus;
  startedAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  progressPercent: number;
}

export type WorkoutExerciseSection = 'warmup' | 'main' | 'cooldown';

export interface WorkoutExerciseSummary {
  /** Stable ID of this exercise placement inside a workout plan. */
  id: string;
  /** Reference to the canonical Exercise entity. */
  exerciseId: string;
  order: number;
  section: WorkoutExerciseSection;
  trackingType: ExerciseTrackingType;
  /** Cached display data keeps saved plans readable offline. */
  name: string;
  nameEn: string;
  nameFa: string;
  targetMuscle?: string;
  thumbnailUrl?: string;
  sets: WorkoutSet[];
}

export interface WorkoutRecurrence {
  frequency: 'weekly';
  interval: number;
  occurrences: number;
}

export interface WorkoutPlan {
  id: number;
  schemaVersion: 2;
  name: string;
  exerciseId?: string;
  thumbnailUrl?: string;
  exercises: WorkoutExerciseSummary[];
  date: Date;
  targetMuscle?: string;
  recurrence?: WorkoutRecurrence;
  /** @deprecated Read-only compatibility for pre-v2 localStorage records. */
  isWeeklyPlan?: boolean;
  sets: WorkoutSet[];
  completionStatus?: WorkoutCompletionStatus;
  session?: WorkoutSession;
}

export type Workout = WorkoutPlan;

export interface CopiedWorkoutClipboard {
  name: string;
  exercises: WorkoutExerciseSummary[];
}
