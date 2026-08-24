import { Component, computed, input, output } from '@angular/core';
import { UpcomingWorkoutConfig } from '../../data-access/models/upcoming-workout-config.interface';
import { UpcomingWorkoutSelectedOutput } from '../../data-access/models/upcoming-workout-selected-output.interface';
import { UpcomingWorkoutCardComponent } from '../upcoming-workout-card/upcoming-workout-card.component';

@Component({
  selector: 'app-upcoming-workouts',
  imports: [UpcomingWorkoutCardComponent],
  templateUrl: './upcoming-workouts.component.html',
})
export class UpcomingWorkoutsComponent {
  readonly config = input.required<UpcomingWorkoutConfig>();
  readonly workouts = computed(() => this.config().workouts ?? []);
  readonly workoutSelected = output<UpcomingWorkoutSelectedOutput>();
}
