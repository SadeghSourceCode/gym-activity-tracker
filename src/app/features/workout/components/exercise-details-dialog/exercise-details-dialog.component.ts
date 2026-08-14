import { Component, input, output } from '@angular/core';
import { ExerciseDbExercise } from '../../services/exercise-db-api.service';
import { AppButton } from '../../../../components/app-button/app-button';
import { ExerciseDetailsDialogConfig } from '../../data-access/models/exercise-details-dialog-config.interface';

@Component({
  selector: 'app-exercise-details-dialog',
  standalone: true,
  imports: [AppButton],
  templateUrl: './exercise-details-dialog.component.html',
})
export class ExerciseDetailsDialogComponent {
  readonly config = input.required<ExerciseDetailsDialogConfig>();

  readonly close = output<void>();
  readonly showExercise = output<ExerciseDbExercise>();

  getExerciseMediaUrl(exercise: ExerciseDbExercise): string | null {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return mediaPath ? this.config().imageBaseUrl + mediaPath : null;
  }
}
