import {
  AfterViewInit,
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { getDateKey, getTodayDateKey, parseDateKey } from '../../utils/calendar-date.util';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { AppButton } from '../../../../components/app-button/app-button';
import { Workout } from '../../models/workout-storage.models';
import { WorkoutCalendarConfig } from '../../data-access/models/workout-calendar-config.interface';
import { getWeeklyRecurrenceEnd, isWorkoutOnDate } from '../../utils/weekly-recurrence.util';

interface CalendarDay {
  label: string;
  dayNumberLabel: string;
  accessibleDateLabel: string;
  date: Date;
  dateKey: string;
}

@Component({
  selector: 'app-workout-calendar',
  standalone: true,
  imports: [AppButton],
  templateUrl: './workout-calendar.component.html',
})
export class WorkoutCalendarComponent implements AfterViewInit {
  @ViewChild('calendarScrollContainer')
  private readonly calendarScrollContainer?: ElementRef<HTMLElement>;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly i18n = inject(I18nService);
  private readonly today = getTodayDateKey();

  readonly config = input.required<WorkoutCalendarConfig>();
  readonly selectedDate = computed(() => this.config().selectedDate ?? this.today);
  readonly workouts = computed<readonly Workout[]>(() => this.config().workouts ?? []);

  readonly dateSelected = output<string>();

  readonly calendarTitle = computed(() =>
    parseDateKey(this.selectedDate()).toLocaleDateString(this.getDateLocale(), {
      month: 'long',
      year: 'numeric',
    }),
  );

  readonly calendarEndDate = computed<Date>(() => {
    let endDate = parseDateKey(this.today);
    endDate.setDate(endDate.getDate() + 14);

    for (const workout of this.workouts()) {
      const recurrenceEnd = getWeeklyRecurrenceEnd(workout);

      if (recurrenceEnd && recurrenceEnd > endDate) {
        endDate = recurrenceEnd;
      }
    }

    const endWeekStart = this.getWeekStart(endDate);
    const lastVisibleDay = new Date(endWeekStart);
    lastVisibleDay.setDate(endWeekStart.getDate() + 6);

    return lastVisibleDay;
  });

  readonly calendarDays = computed<CalendarDay[]>(() => {
    const currentWeekStart = this.getWeekStart(parseDateKey(this.today));
    const firstVisibleDay = new Date(currentWeekStart);
    firstVisibleDay.setDate(currentWeekStart.getDate() - 14);
    const lastVisibleDay = this.calendarEndDate();
    const visibleDayCount =
      Math.round((lastVisibleDay.getTime() - firstVisibleDay.getTime()) / 86_400_000) + 1;

    return Array.from({ length: visibleDayCount }, (_, index) => {
      const date = new Date(firstVisibleDay);
      date.setDate(firstVisibleDay.getDate() + index);

      return {
        label: this.formatWeekdayLabel(date),
        dayNumberLabel: this.formatDayNumber(date),
        accessibleDateLabel: this.formatAccessibleDate(date),
        date,
        dateKey: getDateKey(date),
      };
    });
  });

  readonly workoutDayKeys = computed<Set<string>>(() => {
    const workoutDateKeys = new Set<string>();

    for (const workout of this.workouts()) {
      for (const day of this.calendarDays()) {
        if (isWorkoutOnDate(workout, day.dateKey)) {
          workoutDateKeys.add(day.dateKey);
        }
      }
    }

    return workoutDateKeys;
  });

  selectDate(dateKey: string) {
    this.dateSelected.emit(dateKey);
  }

  selectToday() {
    this.dateSelected.emit(this.today);
    this.scrollTodayToCenter('smooth');
  }

  ngAfterViewInit() {
    if (!this.isBrowser) {
      return;
    }

    requestAnimationFrame(() => this.scrollTodayToCenter('auto'));
  }

  isSelected(dateKey: string): boolean {
    return this.selectedDate() === dateKey;
  }

  isToday(dateKey: string): boolean {
    return this.today === dateKey;
  }

  isWorkoutDay(dateKey: string): boolean {
    return this.workoutDayKeys().has(dateKey);
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
    return date.toLocaleDateString(this.getDateLocale(), {
      month: 'short',
      day: 'numeric',
    });
  }

  private formatDayNumber(date: Date): string {
    return date.toLocaleDateString(this.getDateLocale(), { day: 'numeric' });
  }

  private formatAccessibleDate(date: Date): string {
    return date.toLocaleDateString(this.getDateLocale());
  }

  private formatWeekdayLabel(date: Date): string {
    if (this.i18n.language() === 'fa') {
      const persianWeekdayLabels = ['یک', 'دو', 'سه', 'چها', 'پنج', 'جمعه', 'شنبه'];

      return persianWeekdayLabels[date.getDay()] ?? '';
    }

    return date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);
  }

  private getDateLocale(): string | undefined {
    return this.i18n.language() === 'fa' ? 'fa-IR-u-ca-persian' : undefined;
  }

  private scrollTodayToCenter(behavior: ScrollBehavior) {
    const scrollContainer = this.calendarScrollContainer?.nativeElement;

    if (!scrollContainer) {
      return;
    }

    const todayIndex = this.calendarDays().findIndex((day) => this.isToday(day.dateKey));

    if (todayIndex < 0) {
      return;
    }

    const todayElement = scrollContainer.querySelector<HTMLElement>(
      `[data-date-key="${this.today}"]`,
    );

    if (!todayElement) {
      return;
    }

    todayElement.scrollIntoView({
      behavior,
      block: 'nearest',
      inline: 'center',
    });
  }
}
