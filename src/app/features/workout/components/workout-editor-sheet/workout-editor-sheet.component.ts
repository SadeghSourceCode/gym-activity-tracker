import { Component, input, output } from '@angular/core';
import { ExerciseDbExercise, TargetMuscleOption } from '../../services/exercise-db-api.service';
import { WorkoutExerciseSummary } from '../../models/workout-storage.models';
import { WorkoutEditorTextConfig } from '../../models/workout-ui.models';
import { AppButton } from '../../../../components/app-button/app-button';

export type WorkoutEditorStep = 'muscle' | 'exercises' | 'planning';

@Component({
  selector: 'app-workout-editor-sheet',
  standalone: true,
  imports: [AppButton],
  templateUrl: './workout-editor-sheet.component.html',
})
export class WorkoutEditorSheetComponent {
  readonly text = input.required<WorkoutEditorTextConfig>();
  readonly title = input.required<string>();
  readonly selectedDateLabel = input.required<string>();
  readonly workingDate = input.required<string>();
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
  readonly targetMuscles = input.required<TargetMuscleOption[]>();
  readonly selectedTargetMuscle = input<string | null>(null);
  readonly step = input.required<WorkoutEditorStep>();
  readonly isWeeklyPlan = input.required<boolean>();

  readonly close = output<void>();
  readonly stepChanged = output<WorkoutEditorStep>();
  readonly targetMuscleChanged = output<string>();
  readonly workoutTitleChanged = output<string>();
  readonly workingDateChanged = output<string>();
  readonly weeklyPlanChanged = output<boolean>();
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

  canContinueFromCurrentStep(): boolean {
    switch (this.step()) {
      case 'muscle':
        return Boolean(this.selectedTargetMuscle());
      case 'exercises':
        return Boolean(this.selectedExercises().length);
      case 'planning':
        return true;
    }
  }

  goBack() {
    switch (this.step()) {
      case 'muscle':
        this.close.emit();
        break;
      case 'exercises':
        this.stepChanged.emit('muscle');
        break;
      case 'planning':
        this.stepChanged.emit('exercises');
        break;
    }
  }

  goNext() {
    switch (this.step()) {
      case 'muscle':
        if (this.selectedTargetMuscle()) {
          this.stepChanged.emit('exercises');
        }
        break;
      case 'exercises':
        if (this.selectedExercises().length) {
          this.stepChanged.emit('planning');
        }
        break;
      case 'planning':
        this.save.emit();
        break;
    }
  }

  getExerciseMediaUrl(exercise: ExerciseDbExercise): string | null {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return mediaPath ? this.imageBaseUrl() + mediaPath : null;
  }
}
