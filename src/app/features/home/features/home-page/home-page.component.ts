import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { AppButton } from '../../../../components/app-button/app-button';
import {
  getDateKey,
  getTodayDateKey,
  parseDateKey,
} from '../../../workout/utils/calendar-date.util';
import { isWorkoutOnDate } from '../../../workout/utils/weekly-recurrence.util';
import { HomeService } from '../../data-access/services/home.service';
import { UpcomingWorkoutConfig } from '../../data-access/models/upcoming-workout-config.interface';
import {
  ActivityPeriod,
  WeeklyActivityConfig,
} from '../../data-access/models/weekly-activity-config.interface';
import { UpcomingWorkoutsComponent } from '../../components/upcoming-workouts/upcoming-workouts.component';
import { WeeklyActivityComponent } from '../../components/weekly-activity/weekly-activity.component';

@Component({
  selector: 'app-home-page',
  imports: [AppButton, UpcomingWorkoutsComponent, WeeklyActivityComponent],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  private readonly homeService = inject(HomeService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);
  readonly workouts = signal(this.homeService.loadWorkouts());
  readonly activityPeriod = signal<ActivityPeriod>('week');
  readonly hasWorkoutToday = computed(() =>
    this.workouts().some((workout) => isWorkoutOnDate(workout, getTodayDateKey())),
  );

  readonly upcomingConfig = computed<UpcomingWorkoutConfig>(() => {
    const isPersian = this.i18n.language() === 'fa';
    const today = parseDateKey(getTodayDateKey());
    const dates = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
    const upcoming = dates.flatMap((date) =>
      this.workouts()
        .filter((workout) => isWorkoutOnDate(workout, getDateKey(date)))
        .map((workout) => ({
          id: String(workout.id),
          title: workout.name,
          scheduleLabel: date.toLocaleDateString(isPersian ? 'fa-IR-u-ca-persian' : undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          }),
          exercises: workout.exercises.slice(0, 3).map((exercise) => ({
            id: exercise.id,
            name: isPersian ? exercise.nameFa || exercise.name : exercise.nameEn || exercise.name,
          })),
        })),
    );

    return {
      title: isPersian ? 'پیش رو' : 'Upcoming',
      emptyLabel: isPersian
        ? 'تمرینی برای روزهای آینده برنامه‌ریزی نشده است.'
        : 'No upcoming workouts yet.',
      workouts: upcoming.slice(0, 5),
    };
  });

  readonly activityConfig = computed<WeeklyActivityConfig>(() => {
    const isPersian = this.i18n.language() === 'fa';
    const today = parseDateKey(getTodayDateKey());
    const selectedPeriod = this.activityPeriod();
    const points = this.createActivityPoints(selectedPeriod, today, isPersian);
    const totalMinutes = points.reduce((total, item) => total + item.minutes, 0);
    const periodText = isPersian
      ? { week: 'این هفته', month: 'این ماه', year: 'امسال' }[selectedPeriod]
      : { week: 'this week', month: 'this month', year: 'this year' }[selectedPeriod];

    return {
      title: isPersian ? 'فعالیت‌ها' : 'Activities',
      selectedPeriod,
      periodOptions: [
        { id: 'week', label: isPersian ? 'هفته' : 'Week' },
        { id: 'month', label: isPersian ? 'ماه' : 'Month' },
        { id: 'year', label: isPersian ? 'سال' : 'Year' },
      ],
      durationLabel: isPersian
        ? `${totalMinutes.toLocaleString('fa-IR')} دقیقه ${periodText}`
        : `${totalMinutes} minutes ${periodText}`,
      points,
    };
  });

  openWorkout(workoutId: string): void {
    void this.router.navigate(['/workouts/workout-detail', workoutId]);
  }

  addWorkout(): void {
    void this.router.navigateByUrl('/workouts/add-workout');
  }

  selectActivityPeriod(period: ActivityPeriod): void {
    this.activityPeriod.set(period);
  }

  private createActivityPoints(period: ActivityPeriod, today: Date, isPersian: boolean) {
    if (period === 'year') {
      return Array.from({ length: 12 }, (_, month) => {
        const start = new Date(today.getFullYear(), month, 1);
        const end = new Date(today.getFullYear(), month + 1, 0);
        return {
          dateKey: getDateKey(start),
          label: (month + 1).toLocaleString(isPersian ? 'fa-IR' : 'en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }),
          minutes: this.getActivityMinutesBetween(start, end),
          selected: month === today.getMonth(),
        };
      });
    }

    if (period === 'month') {
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const weekOrdinals = isPersian
        ? ['اول', 'دوم', 'سوم', 'چهارم', 'پنجم']
        : ['one', 'two', 'three', 'four', 'five'];
      return Array.from({ length: Math.ceil(lastDay / 7) }, (_, index) => {
        const startDay = index * 7 + 1;
        const endDay = Math.min(startDay + 6, lastDay);
        const start = new Date(today.getFullYear(), today.getMonth(), startDay);
        const end = new Date(today.getFullYear(), today.getMonth(), endDay);
        return {
          dateKey: getDateKey(start),
          label: isPersian ? `هفته ${weekOrdinals[index]}` : `Week ${weekOrdinals[index]}`,
          minutes: this.getActivityMinutesBetween(start, end),
          selected: today.getDate() >= startDay && today.getDate() <= endDay,
        };
      });
    }

    const weekStart = new Date(today);
    const day = today.getDay();
    weekStart.setDate(today.getDate() + (day === 0 ? -6 : 1 - day));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        dateKey: getDateKey(date),
        label: date.toLocaleDateString(isPersian ? 'fa-IR-u-ca-persian' : undefined, {
          day: '2-digit',
        }),
        minutes: this.getActivityMinutesForDate(date),
        selected: getDateKey(date) === getTodayDateKey(),
      };
    });
  }

  private getActivityMinutesBetween(start: Date, end: Date): number {
    let total = 0;
    const date = new Date(start);
    while (date <= end) {
      total += this.getActivityMinutesForDate(date);
      date.setDate(date.getDate() + 1);
    }
    return total;
  }

  private getActivityMinutesForDate(date: Date): number {
    const dateKey = getDateKey(date);
    const exerciseCount = this.workouts()
      .filter((workout) => isWorkoutOnDate(workout, dateKey))
      .reduce((total, workout) => total + workout.exercises.length, 0);
    return exerciseCount * 12;
  }
}
