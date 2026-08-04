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

  readonly open = output<string>();
  readonly reject = output<string>();
  readonly edit = output<string>();
}
