import { Component, input, output } from '@angular/core';
import { AppButton } from '../../../../components/app-button/app-button';

@Component({
  selector: 'app-empty-day-state',
  standalone: true,
  imports: [AppButton],
  templateUrl: './empty-day-state.component.html',
})
export class EmptyDayStateComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly setWorkoutLabel = input.required<string>();
  readonly markAsRestDayLabel = input.required<string>();

  readonly setWorkout = output<void>();
  readonly markAsRestDay = output<void>();
}
