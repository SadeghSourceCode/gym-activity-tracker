import { Component, input, output } from '@angular/core';
import { AppButton } from '../../../../components/app-button/app-button';
import { EmptyDayStateConfig } from '../../data-access/models/empty-day-state-config.interface';

@Component({
  selector: 'app-empty-day-state',
  standalone: true,
  imports: [AppButton],
  templateUrl: './empty-day-state.component.html',
})
export class EmptyDayStateComponent {
  readonly config = input.required<EmptyDayStateConfig>();

  readonly setWorkout = output<void>();
  readonly markAsRestDay = output<void>();
}
