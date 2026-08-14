import { Component, computed, input, output } from '@angular/core';
import { AppButton } from '../../../../components/app-button/app-button';
import { UpcomingWorkoutConfig } from '../../data-access/models/upcoming-workout-config.interface';
import { UpcomingWorkoutSelectedOutput } from '../../data-access/models/upcoming-workout-selected-output.interface';

@Component({
  selector: 'app-upcoming-workouts',
  imports: [AppButton],
  templateUrl: './upcoming-workouts.component.html',
})
export class UpcomingWorkoutsComponent {
  readonly config = input.required<UpcomingWorkoutConfig>();
  readonly workouts = computed(() => this.config().workouts ?? []);
  readonly workoutSelected = output<UpcomingWorkoutSelectedOutput>();
}
