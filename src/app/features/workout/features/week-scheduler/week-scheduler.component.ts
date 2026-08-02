import { Component, computed, input } from '@angular/core';
import {
  WeekSchedulerEvent,
  WeekSchedulerGridComponent,
} from './week-scheduler-grid.component';

export interface SchedulableWorkout {
  id: number;
  name: string;
  date: Date;
  thumbnailUrl?: string;
}

@Component({
  selector: 'app-week-scheduler',
  standalone: true,
  imports: [WeekSchedulerGridComponent],
  templateUrl: './week-scheduler.component.html',
})
export class WeekSchedulerComponent {
  workouts = input.required<SchedulableWorkout[]>();

  readonly events = computed<WeekSchedulerEvent[]>(() =>
    this.workouts().map((workout) => ({
      id: workout.id,
      title: workout.name,
      startsAt: workout.date,
      durationMinutes: 60,
      thumbnailUrl: workout.thumbnailUrl,
    })),
  );
}
