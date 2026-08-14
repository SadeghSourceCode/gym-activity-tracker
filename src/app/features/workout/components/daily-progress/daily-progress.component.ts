import { Component, input } from '@angular/core';
import { DailyProgressConfig } from '../../data-access/models/daily-progress-config.interface';

@Component({
  selector: 'app-daily-progress',
  standalone: true,
  templateUrl: './daily-progress.component.html',
})
export class DailyProgressComponent {
  readonly config = input.required<DailyProgressConfig>();
  readonly ringRadii = [62, 46, 30] as const;

  getRingProgress(metricIndex: number): number {
    const metric = this.config().metrics[metricIndex];

    if (!metric?.value || metric.goal <= 0) {
      return 0;
    }

    return Math.min(metric.value / metric.goal, 1);
  }

  getRingDashArray(metricIndex: number): string {
    const radius = this.ringRadii[metricIndex] ?? 30;
    const circumference = 2 * Math.PI * radius;
    const completed = circumference * this.getRingProgress(metricIndex);

    return `${completed} ${circumference - completed}`;
  }
}
