import { Component, input, output } from '@angular/core';
import {
  Exercise,
  getExerciseMediaPath,
} from '../../../exercise-library/data-access/models/exercise.models';
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
  readonly showExercise = output<Exercise>();

  getExerciseMediaUrl(exercise: Exercise): string | null {
    const mediaPath = getExerciseMediaPath(exercise);

    return mediaPath ? this.config().imageBaseUrl + mediaPath : null;
  }
}
