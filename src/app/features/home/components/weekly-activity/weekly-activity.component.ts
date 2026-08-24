import { Component, computed, input, output } from '@angular/core';
import { AppButton } from '../../../../components/app-button/app-button';
import {
  ActivityPeriod,
  WeeklyActivityConfig,
} from '../../data-access/models/weekly-activity-config.interface';

@Component({
  selector: 'app-weekly-activity',
  imports: [AppButton],
  templateUrl: './weekly-activity.component.html',
})
export class WeeklyActivityComponent {
  readonly config = input.required<WeeklyActivityConfig>();
  readonly periodSelected = output<ActivityPeriod>();
  readonly chartPoints = computed(() => {
    const points = this.config().points;
    const max = Math.max(60, ...points.map((point) => point.minutes));
    const step = points.length > 1 ? 300 / (points.length - 1) : 0;
    return points
      .map((point, index) => `${index * step + 10},${130 - (point.minutes / max) * 100}`)
      .join(' ');
  });
}
