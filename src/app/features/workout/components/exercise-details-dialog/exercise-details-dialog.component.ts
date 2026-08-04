import { Component, input, output } from '@angular/core';
import { ExerciseDbExercise } from '../../services/exercise-db-api.service';
import { ExerciseDetailsTextConfig } from '../../models/workout-ui.models';
import { AppButton } from '../../../../components/app-button/app-button';

@Component({
  selector: 'app-exercise-details-dialog',
  standalone: true,
  imports: [AppButton],
  templateUrl: './exercise-details-dialog.component.html',
})
export class ExerciseDetailsDialogComponent {
  readonly text = input.required<ExerciseDetailsTextConfig>();
  readonly exercise = input.required<ExerciseDbExercise>();
  readonly similarExercises = input<ExerciseDbExercise[]>([]);
  readonly imageBaseUrl = input.required<string>();

  readonly close = output<void>();
  readonly showExercise = output<ExerciseDbExercise>();

  getExerciseMediaUrl(exercise: ExerciseDbExercise): string | null {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return mediaPath ? this.imageBaseUrl() + mediaPath : null;
  }
}
