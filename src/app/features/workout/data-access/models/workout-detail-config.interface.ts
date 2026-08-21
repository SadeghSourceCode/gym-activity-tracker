import { Workout, WorkoutExerciseSection } from './workout-storage.models';
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
  startWorkoutLabel: string;
  resumeWorkoutLabel: string;
  completeSetLabel: string;
  completedSetLabel: string;
  storageErrorLabel: string;
  addExerciseLabel: string;
  chooseExerciseLabel: string;
  noExercisesFoundLabel: string;
  leaveWorkoutConfirmation: string;
  workoutCompleteMessage: string;
  isPersian: boolean;
}

export interface WorkoutDetailConfig {
  text: WorkoutDetailTextConfig;
  workout: Workout;
  imageBaseUrl: string;
  canManage?: boolean;
  isSessionActive?: boolean;
  persistenceError?: boolean;
  replacingExerciseId?: string | null;
  replacementExercises?: readonly Exercise[];
  replacementExercisesLoading?: boolean;
  addingExerciseSection?: WorkoutExerciseSection | null;
  availableExercises?: readonly Exercise[];
  availableExercisesLoading?: boolean;
  celebrating?: boolean;
}
