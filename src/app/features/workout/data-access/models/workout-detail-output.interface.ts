import { WorkoutCompletionStatus } from './workout-planner.models';
import { WorkoutSet } from './workout-storage.models';
import { ExerciseDbExercise } from '../services/exercise-db-api.service';

export interface WorkoutExerciseOutput {
  workoutId: number;
  exerciseId: string;
}

export interface WorkoutExerciseReplacedOutput extends WorkoutExerciseOutput {
  replacement: ExerciseDbExercise;
}

export interface WorkoutSetUpdatedOutput extends WorkoutExerciseOutput {
  setId: number;
  changes: Partial<Pick<WorkoutSet, 'repeat' | 'weight'>>;
}

export interface WorkoutCompletedOutput {
  workoutId: number;
  completionStatus: Extract<WorkoutCompletionStatus, 'completed' | 'rejected'>;
}
