import { Exercise } from '../../../exercise-library/data-access/models/exercise.models';

export interface ExerciseDetailsDialogTextConfig {
  exerciseDetailsLabel: string;
  closeExerciseDetailsLabel: string;
  noDescriptionAvailableLabel: string;
  similarExercisesLabel: string;
}

export interface ExerciseDetailsDialogConfig {
  text: ExerciseDetailsDialogTextConfig;
  exercise: Exercise;
  imageBaseUrl: string;
  similarExercises?: readonly Exercise[];
}
