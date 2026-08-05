import { Component, input, output } from '@angular/core';
import {
  Workout,
  WorkoutExerciseSummary,
  WorkoutSet,
} from '../../models/workout-storage.models';
import { WorkoutCompletionStatus } from '../../models/workout-planner.models';
import { WorkoutDetailTextConfig } from '../../models/workout-ui.models';
import { AppButton } from '../../../../components/app-button/app-button';

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

  readonly close = output<void>();
  readonly addSet = output<{ workoutId: number; exerciseId: string }>();
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
}
