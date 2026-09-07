import { Component, input, output } from '@angular/core';
import { AppButton } from '../../../../components/app-button/app-button';
import { TodayWorkoutEmptyStateConfig } from '../../data-access/models/today-workout-empty-state-config.interface';

@Component({
  selector: 'app-today-workout-empty-state',
  imports: [AppButton],
  templateUrl: './today-workout-empty-state.component.html',
})
export class TodayWorkoutEmptyStateComponent {
  readonly config = input.required<TodayWorkoutEmptyStateConfig>();
  readonly workoutAddRequested = output<void>();
}
