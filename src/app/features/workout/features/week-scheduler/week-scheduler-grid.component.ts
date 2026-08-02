import { Component, computed, input } from '@angular/core';

export interface WeekSchedulerEvent {
  id: number;
  title: string;
  startsAt: Date;
  durationMinutes: number;
  thumbnailUrl?: string;
}

interface WeekDay {
  label: string;
  date: Date;
  events: PositionedWeekSchedulerEvent[];
}

interface PositionedWeekSchedulerEvent extends WeekSchedulerEvent {
  topPercent: number;
  heightPercent: number;
}

@Component({
  selector: 'app-week-scheduler-grid',
  standalone: true,
  templateUrl: './week-scheduler-grid.component.html',
})
export class WeekSchedulerGridComponent {
  events = input.required<WeekSchedulerEvent[]>();

  private readonly dayStartHour = 6;
  private readonly dayEndHour = 22;
  private readonly visibleMinutes = (this.dayEndHour - this.dayStartHour) * 60;

  readonly hours = Array.from(
    { length: this.dayEndHour - this.dayStartHour + 1 },
    (_, index) => this.dayStartHour + index,
  );

  readonly weekDays = computed<WeekDay[]>(() => {
    const weekStart = this.getWeekStart(new Date());

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return {
        label: date.toLocaleDateString(undefined, { weekday: 'short' }),
        date,
        events: this.getEventsForDate(date),
      };
    });
  });

  getEventStyle(event: PositionedWeekSchedulerEvent): Record<string, string> {
    return {
      top: `${event.topPercent}%`,
      height: `${event.heightPercent}%`,
    };
  }

  private getEventsForDate(date: Date): PositionedWeekSchedulerEvent[] {
    return this.events()
      .filter((event) => this.isSameDate(event.startsAt, date))
      .map((event) => this.positionEvent(event))
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }

  private positionEvent(event: WeekSchedulerEvent): PositionedWeekSchedulerEvent {
    const startMinutes = event.startsAt.getHours() * 60 + event.startsAt.getMinutes();
    const relativeStartMinutes = Math.max(0, startMinutes - this.dayStartHour * 60);
    const constrainedDuration = Math.min(
      event.durationMinutes,
      this.visibleMinutes - relativeStartMinutes,
    );

    return {
      ...event,
      topPercent: (relativeStartMinutes / this.visibleMinutes) * 100,
      heightPercent: (Math.max(constrainedDuration, 30) / this.visibleMinutes) * 100,
    };
  }

  private getWeekStart(date: Date): Date {
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    weekStart.setDate(weekStart.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    return weekStart;
  }

  private isSameDate(left: Date, right: Date): boolean {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }
}
