import {
  AfterViewInit,
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface CalendarDay {
  label: string;
  date: Date;
}

@Component({
  selector: 'app-workout-calendar',
  standalone: true,
  templateUrl: './workout-calendar.component.html',
})
export class WorkoutCalendarComponent implements AfterViewInit {
  @ViewChild('calendarScrollContainer')
  private readonly calendarScrollContainer?: ElementRef<HTMLElement>;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly today = this.startOfDay(new Date());

  readonly selectedDate = signal(this.startOfDay(new Date()));

  readonly calendarTitle = computed(() =>
    this.selectedDate().toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    }),
  );

  readonly calendarDays = computed<CalendarDay[]>(() => {
    const currentWeekStart = this.getWeekStart(this.today);
    const firstVisibleDay = new Date(currentWeekStart);
    firstVisibleDay.setDate(currentWeekStart.getDate() - 14);

    return Array.from({ length: 35 }, (_, index) => {
      const date = new Date(firstVisibleDay);
      date.setDate(firstVisibleDay.getDate() + index);

      return {
        label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2),
        date,
      };
    });
  });

  readonly weekRangeLabel = computed(() => {
    const selectedWeekStart = this.getWeekStart(this.selectedDate());
    const selectedWeekEnd = new Date(selectedWeekStart);
    selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);

    return `${this.formatShortDate(selectedWeekStart)} - ${this.formatShortDate(selectedWeekEnd)}`;
  });

  selectDate(date: Date) {
    this.selectedDate.set(this.startOfDay(date));
  }

  selectToday() {
    this.selectedDate.set(this.today);
    this.scrollTodayToCenter('smooth');
  }

  ngAfterViewInit() {
    if (!this.isBrowser) {
      return;
    }

    requestAnimationFrame(() => this.scrollTodayToCenter('auto'));
  }

  isSelected(date: Date): boolean {
    return this.selectedDate().getTime() === this.startOfDay(date).getTime();
  }

  isToday(date: Date): boolean {
    return this.today.getTime() === this.startOfDay(date).getTime();
  }

  private getWeekStart(date: Date): Date {
    const weekStart = this.startOfDay(date);
    const day = weekStart.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    weekStart.setDate(weekStart.getDate() + mondayOffset);

    return weekStart;
  }

  private startOfDay(date: Date): Date {
    const nextDate = new Date(date);
    nextDate.setHours(0, 0, 0, 0);

    return nextDate;
  }

  private formatShortDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  private scrollTodayToCenter(behavior: ScrollBehavior) {
    const scrollContainer = this.calendarScrollContainer?.nativeElement;

    if (!scrollContainer) {
      return;
    }

    const todayIndex = this.calendarDays().findIndex((day) => this.isToday(day.date));
    const dayWidth = 32;
    const dayGap = 16;
    const dayStep = dayWidth + dayGap;
    const todayCenter = todayIndex * dayStep + dayWidth / 2;

    scrollContainer.scrollTo({
      left: Math.max(0, todayCenter - scrollContainer.clientWidth / 2),
      behavior,
    });
  }
}
