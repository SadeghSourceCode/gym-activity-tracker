import { WorkoutExerciseSection, WorkoutSet } from './workout-storage.models';
import { Exercise } from '../../../exercise-library/data-access/models/exercise.models';

export interface WorkoutExerciseOutput {
  workoutId: number;
  exerciseId: string;
}

export interface WorkoutExerciseReplacedOutput extends WorkoutExerciseOutput {
  replacement: Exercise;
}

export interface WorkoutExerciseAddedOutput {
  workoutId: number;
  section: WorkoutExerciseSection;
  exercise: Exercise;
}

export interface WorkoutSetUpdatedOutput extends WorkoutExerciseOutput {
  setId: number;
  changes: Partial<Pick<WorkoutSet, 'reps' | 'weightKg' | 'completed' | 'completedAt'>>;
}
