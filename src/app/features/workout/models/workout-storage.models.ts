import { WorkoutCompletionStatus } from './workout-planner.models';

export interface WorkoutSet {
  id: number;
  repeat: number;
  weight: number;
}

export interface WorkoutExerciseSummary {
  id: string;
  name: string;
  nameEn: string;
  nameFa: string;
  targetMuscle?: string;
  thumbnailUrl?: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: number;
  name: string;
  exerciseId?: string;
  thumbnailUrl?: string;
  exercises: WorkoutExerciseSummary[];
  date: Date;
  targetMuscle?: string;
  isWeeklyPlan?: boolean;
  sets: WorkoutSet[];
  completionStatus?: WorkoutCompletionStatus;
}

export interface CopiedWorkoutClipboard {
  name: string;
  exercises: WorkoutExerciseSummary[];
}
