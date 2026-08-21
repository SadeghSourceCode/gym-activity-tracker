import { Workout } from './workout-storage.models';
import { Exercise } from '../../../exercise-library/data-access/models/exercise.models';

export interface WorkoutDetailTextConfig {
  workoutDetailsLabel: string;
  closeWorkoutDetailsLabel: string;
  warmupLabel: string;
  mainWorkoutLabel: string;
  cooldownLabel: string;
  startRestLabel: string;
  restTimerLabel: string;
  restCompleteLabel: string;
  closeRestTimerLabel: string;
  addFifteenSecondsLabel: string;
  removeFifteenSecondsLabel: string;
  repeatLabel: string;
  weightLabel: string;
  addSetLabel: string;
  changeExerciseLabel: string;
  removeExerciseLabel: string;
  chooseReplacementLabel: string;
  noSimilarExercisesLabel: string;
  loadingExercisesLabel: string;
  markAsDoneLabel: string;
  rejectWorkoutLabel: string;
  isPersian: boolean;
}

export interface WorkoutDetailConfig {
  text: WorkoutDetailTextConfig;
  workout: Workout;
  imageBaseUrl: string;
  canManage?: boolean;
  replacingExerciseId?: string | null;
  replacementExercises?: readonly Exercise[];
  replacementExercisesLoading?: boolean;
}
