import { ExerciseDbExercise } from '../../services/exercise-db-api.service';

export interface ExerciseDetailsDialogTextConfig {
  exerciseDetailsLabel: string;
  closeExerciseDetailsLabel: string;
  noDescriptionAvailableLabel: string;
  similarExercisesLabel: string;
}

export interface ExerciseDetailsDialogConfig {
  text: ExerciseDetailsDialogTextConfig;
  exercise: ExerciseDbExercise;
  imageBaseUrl: string;
  similarExercises?: readonly ExerciseDbExercise[];
}
