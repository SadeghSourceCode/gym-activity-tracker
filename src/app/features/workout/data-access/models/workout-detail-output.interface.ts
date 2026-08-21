import { WorkoutCompletionStatus } from './workout-planner.models';
import { WorkoutSet } from './workout-storage.models';
import { Exercise } from '../../../exercise-library/data-access/models/exercise.models';

export interface WorkoutExerciseOutput {
  workoutId: number;
  exerciseId: string;
}

export interface WorkoutExerciseReplacedOutput extends WorkoutExerciseOutput {
  replacement: Exercise;
}

export interface WorkoutSetUpdatedOutput extends WorkoutExerciseOutput {
  setId: number;
  changes: Partial<Pick<WorkoutSet, 'reps' | 'weightKg'>>;
}

export interface WorkoutCompletedOutput {
  workoutId: number;
  completionStatus: Extract<WorkoutCompletionStatus, 'completed' | 'rejected'>;
}
