import { Component, input } from '@angular/core';
import { WorkoutOverviewConfig } from '../../data-access/models/workout-overview-config.interface';

@Component({
  selector: 'app-workout-overview',
  standalone: true,
  templateUrl: './workout-overview.component.html',
})
export class WorkoutOverviewComponent {
  readonly config = input.required<WorkoutOverviewConfig>();
}
