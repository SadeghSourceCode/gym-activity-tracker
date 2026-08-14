import { Component, computed, input } from '@angular/core';
import { WeeklyActivityConfig } from '../../data-access/models/weekly-activity-config.interface';

@Component({
  selector: 'app-weekly-activity',
  templateUrl: './weekly-activity.component.html',
})
export class WeeklyActivityComponent {
  readonly config = input.required<WeeklyActivityConfig>();
  readonly chartPoints = computed(() => {
    const days = this.config().days;
    const max = Math.max(60, ...days.map((day) => day.minutes));
    return days
      .map((day, index) => `${index * 50 + 10},${130 - (day.minutes / max) * 100}`)
      .join(' ');
  });
}
