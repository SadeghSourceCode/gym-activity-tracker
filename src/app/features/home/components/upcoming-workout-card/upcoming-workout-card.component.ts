import { Component, input, output } from '@angular/core';
import { UpcomingWorkoutItemConfig } from '../../data-access/models/upcoming-workout-config.interface';

@Component({
  selector: 'app-upcoming-workout-card',
  templateUrl: './upcoming-workout-card.component.html',
})
export class UpcomingWorkoutCardComponent {
  readonly workout = input.required<UpcomingWorkoutItemConfig>();
  readonly selected = output<string>();
}
