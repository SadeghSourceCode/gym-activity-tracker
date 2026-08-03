import { Component, computed, input, output } from '@angular/core';
import {
  SelectedDayViewModel,
  WorkoutDisplayStatus,
} from '../../models/workout-planner.models';
import { SelectedDayPanelTextConfig } from '../../models/workout-ui.models';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { WorkoutSummaryCardComponent } from '../workout-summary-card/workout-summary-card.component';
import { RestDayStateComponent } from '../rest-day-state/rest-day-state.component';
import { EmptyDayStateComponent } from '../empty-day-state/empty-day-state.component';

@Component({
  selector: 'app-selected-day-panel',
  standalone: true,
  imports: [
    StatusBadgeComponent,
    WorkoutSummaryCardComponent,
    RestDayStateComponent,
    EmptyDayStateComponent,
  ],
  templateUrl: './selected-day-panel.component.html',
})
export class SelectedDayPanelComponent {
  readonly text = input.required<SelectedDayPanelTextConfig>();
  readonly selectedDateLabel = input.required<string>();
  readonly selectedDayViewModel = input.required<SelectedDayViewModel>();
  readonly selectedDayWorkoutStatus = input<WorkoutDisplayStatus | null>(null);
  readonly selectedDayError = input<string | null>(null);

  readonly retry = output<void>();
  readonly openWorkoutDetails = output<string>();
  readonly rejectWorkout = output<string>();
  readonly editWorkout = output<string>();
  readonly setWorkout = output<void>();
  readonly markAsRestDay = output<void>();
  readonly removeRestDay = output<void>();

  statusLabel = computed<string>(() => {
    let result = this.text().inProgressLabel;
    switch (this.selectedDayWorkoutStatus()) {
      case 'in-progress':
        result= this.text().inProgressLabel;
        break;
      case 'done':
        result= this.text().doneLabel;
        break;
      case 'rejected':
        result= this.text().rejectedLabel;
        break;
      case 'upcoming':
        result= this.text().incomingLabel;
        break;
    }
    return result;
  })

  getExerciseCountLabel(exerciseCount: number): string {
    return this.text().isPersian
      ? `${exerciseCount} حرکت`
      : `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  }
}
