import { Component, input, output } from '@angular/core';
import { ExerciseDbExercise } from '../../services/exercise-db-api.service';
import { WorkoutExerciseSummary } from '../../models/workout-storage.models';
import { WorkoutEditorTextConfig } from '../../models/workout-ui.models';

@Component({
  selector: 'app-workout-editor-sheet',
  standalone: true,
  templateUrl: './workout-editor-sheet.component.html',
})
export class WorkoutEditorSheetComponent {
  readonly text = input.required<WorkoutEditorTextConfig>();
  readonly title = input.required<string>();
  readonly selectedDateLabel = input.required<string>();
  readonly workoutTitle = input.required<string>();
  readonly defaultWorkoutTitle = input.required<string>();
  readonly saveButtonLabel = input.required<string>();
  readonly selectedExercises = input.required<WorkoutExerciseSummary[]>();
  readonly imageBaseUrl = input.required<string>();
  readonly exerciseSearchQuery = input.required<string>();
  readonly exerciseSearchResults = input.required<ExerciseDbExercise[]>();
  readonly exerciseSearchTotal = input.required<number>();
  readonly isExerciseSearchLoading = input.required<boolean>();
  readonly exerciseSearchError = input<string | null>(null);

  readonly close = output<void>();
  readonly workoutTitleChanged = output<string>();
  readonly searchExercises = output<string>();
  readonly removeSelectedExercise = output<string>();
  readonly toggleExercise = output<ExerciseDbExercise>();
  readonly scrolled = output<Event>();
  readonly loadMore = output<void>();
  readonly save = output<void>();

  getExerciseCountLabel(exerciseCount: number): string {
    return this.text().isPersian
      ? `${exerciseCount} حرکت`
      : `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  }

  getWorkoutExerciseName(exercise: WorkoutExerciseSummary): string {
    return this.text().isPersian ? exercise.nameFa : exercise.nameEn;
  }

  isExerciseSelected(exerciseId: string): boolean {
    return this.selectedExercises().some((exercise) => exercise.id === exerciseId);
  }

  getExerciseMediaUrl(exercise: ExerciseDbExercise): string | null {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return mediaPath ? this.imageBaseUrl() + mediaPath : null;
  }
}
