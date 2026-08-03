import { Component, input } from '@angular/core';
import { WorkoutDisplayStatus } from '../../models/workout-planner.models';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  readonly status = input.required<WorkoutDisplayStatus>();
  readonly label = input.required<string>();
}

