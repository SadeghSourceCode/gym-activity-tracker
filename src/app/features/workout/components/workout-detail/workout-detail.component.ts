import { Component, input, output } from '@angular/core';
import {
  Workout,
  WorkoutExerciseSummary,
  WorkoutSet,
} from '../../models/workout-storage.models';
import { WorkoutCompletionStatus } from '../../models/workout-planner.models';
import { WorkoutDetailTextConfig } from '../../models/workout-ui.models';
import { AppButton } from '../../../../components/app-button/app-button';
import { ExerciseDbExercise } from '../../services/exercise-db-api.service';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [AppButton],
  templateUrl: './workout-detail.component.html',
})
export class WorkoutDetailComponent {
  readonly text = input.required<WorkoutDetailTextConfig>();
  readonly workout = input.required<Workout>();
  readonly canManage = input.required<boolean>();
  readonly replacingExerciseId = input<string | null>(null);
  readonly replacementExercises = input<ExerciseDbExercise[]>([]);
  readonly replacementExercisesLoading = input(false);
  readonly imageBaseUrl = input.required<string>();

  readonly close = output<void>();
  readonly addSet = output<{ workoutId: number; exerciseId: string }>();
  readonly removeExercise = output<{ workoutId: number; exerciseId: string }>();
  readonly requestExerciseReplacement = output<WorkoutExerciseSummary>();
  readonly cancelExerciseReplacement = output<void>();
  readonly replaceExercise = output<{
    workoutId: number;
    exerciseId: string;
    replacement: ExerciseDbExercise;
  }>();
  readonly updateSet = output<{
    workoutId: number;
    exerciseId: string;
    setId: number;
    changes: Partial<Pick<WorkoutSet, 'repeat' | 'weight'>>;
  }>();
  readonly complete = output<{
    workoutId: number;
    completionStatus: Extract<WorkoutCompletionStatus, 'completed' | 'rejected'>;
  }>();

  getExerciseCountLabel(exerciseCount: number): string {
    return this.text().isPersian
      ? `${exerciseCount} حرکت`
      : `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  }

  getWorkoutExerciseName(exercise: WorkoutExerciseSummary): string {
    return this.text().isPersian ? exercise.nameFa : exercise.nameEn;
  }

  getExerciseMediaUrl(exercise: ExerciseDbExercise): string | null {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return mediaPath ? this.imageBaseUrl() + mediaPath : null;
  }
}
