import { Workout } from '../../models/workout-storage.models';
import { ExerciseDbExercise } from '../../services/exercise-db-api.service';

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
  replacementExercises?: readonly ExerciseDbExercise[];
  replacementExercisesLoading?: boolean;
}
