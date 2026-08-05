import { Component, input, output } from '@angular/core';
import { WorkoutCardViewModel } from '../../models/workout-planner.models';
import { AppButton } from '../../../../components/app-button/app-button';

@Component({
  selector: 'app-workout-summary-card',
  standalone: true,
  imports: [AppButton],
  templateUrl: './workout-summary-card.component.html',
})
export class WorkoutSummaryCardComponent {
  readonly workout = input.required<WorkoutCardViewModel>();
  readonly exerciseCountLabel = input.required<string>();
  readonly openLabel = input.required<string>();
  readonly rejectLabel = input.required<string>();
  readonly editLabel = input.required<string>();
  readonly deleteLabel = input.required<string>();
  readonly canManage = input.required<boolean>();

  readonly open = output<string>();
  readonly reject = output<string>();
  readonly edit = output<string>();
  readonly deleteWorkout = output<string>();

  readonly visibleExerciseLimit = 3;

  visibleExercises() {
    return this.workout().exercises.slice(0, this.visibleExerciseLimit);
  }

  hiddenExerciseCount(): number {
    return Math.max(this.workout().exerciseCount - this.visibleExerciseLimit, 0);
  }

  getEstimatedDurationLabel(): string {
    return `est. ${this.workout().estimatedMinutes} min`;
  }
}
