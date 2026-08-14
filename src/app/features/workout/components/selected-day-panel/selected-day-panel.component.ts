import { Component, computed, input, output } from '@angular/core';
import { SelectedDayPanelConfig } from '../../data-access/models/selected-day-panel-config.interface';
import { WorkoutSummaryCardConfig } from '../../data-access/models/workout-summary-card-config.interface';
import { WorkoutCardViewModel } from '../../data-access/models/workout-planner.models';
import { EmptyDayStateConfig } from '../../data-access/models/empty-day-state-config.interface';
import { RestDayStateConfig } from '../../data-access/models/rest-day-state-config.interface';
import { StatusBadgeConfig } from '../../data-access/models/status-badge-config.interface';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { WorkoutSummaryCardComponent } from '../workout-summary-card/workout-summary-card.component';
import { RestDayStateComponent } from '../rest-day-state/rest-day-state.component';
import { EmptyDayStateComponent } from '../empty-day-state/empty-day-state.component';
import { AppButton } from '../../../../components/app-button/app-button';

@Component({
  selector: 'app-selected-day-panel',
  standalone: true,
  imports: [
    StatusBadgeComponent,
    WorkoutSummaryCardComponent,
    RestDayStateComponent,
    EmptyDayStateComponent,
    AppButton,
  ],
  templateUrl: './selected-day-panel.component.html',
})
export class SelectedDayPanelComponent {
  readonly config = input.required<SelectedDayPanelConfig>();

  readonly retry = output<void>();
  readonly openWorkoutDetails = output<string>();
  readonly editWorkout = output<string>();
  readonly deleteWorkout = output<string>();
  readonly copyWorkout = output<string>();
  readonly setWorkout = output<void>();
  readonly markAsRestDay = output<void>();
  readonly removeRestDay = output<void>();

  readonly statusLabel = computed<string>(() => {
    const text = this.config().text;

    switch (this.config().workoutStatus) {
      case 'in-progress':
        return text.inProgressLabel;
      case 'done':
        return text.doneLabel;
      case 'rejected':
        return text.rejectedLabel;
      case 'upcoming':
        return text.incomingLabel;
      default:
        return text.inProgressLabel;
    }
  });

  readonly statusBadgeConfig = computed<StatusBadgeConfig | null>(() => {
    const status = this.config().workoutStatus;

    return status ? { status, label: this.statusLabel() } : null;
  });

  readonly restDayStateConfig = computed<RestDayStateConfig>(() => ({
    title: this.config().text.restDayTitle,
    message: this.config().text.recoveryMessage,
    removeLabel: this.config().text.removeRestDayLabel,
  }));

  readonly emptyDayStateConfig = computed<EmptyDayStateConfig>(() => ({
    title: this.config().text.noWorkoutPlannedTitle,
    message: this.config().text.setWorkoutOrRestMessage,
    setWorkoutLabel: this.config().text.setWorkoutLabel,
    markAsRestDayLabel: this.config().text.markAsRestDayLabel,
  }));

  getExerciseCountLabel(exerciseCount: number): string {
    return this.config().text.isPersian
      ? `${exerciseCount} حرکت`
      : `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  }

  getWorkoutSummaryCardConfig(workout: WorkoutCardViewModel): WorkoutSummaryCardConfig {
    const config = this.config();

    return {
      workout,
      exerciseCountLabel: this.getExerciseCountLabel(workout.exerciseCount),
      openLabel: config.text.openLabel,
      copyLabel: config.text.copyLabel,
      copiedLabel: config.text.copiedLabel,
      headingLabel: config.text.workoutSummaryHeadingLabel,
      startLabel: config.text.startWorkoutLabel,
      editLabel: config.text.editLabel,
      deleteLabel: config.text.deleteLabel,
      closeMenuLabel: config.text.closeMenuLabel,
      estimatedLabel: config.text.estimatedLabel,
      minutesLabel: config.text.minutesLabel,
      moreExercisesLabel: config.text.moreExercisesLabel,
      canManage: config.selectedDayViewModel.canManageWorkouts,
    };
  }
}
