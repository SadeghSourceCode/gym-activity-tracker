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
import { NearbyGymsConfig } from '../../data-access/models/nearby-gyms-config.interface';
import { WeeklyActivityConfig } from '../../data-access/models/weekly-activity-config.interface';
import { UpcomingWorkoutsComponent } from '../../components/upcoming-workouts/upcoming-workouts.component';
import { NearbyGymsComponent } from '../../components/nearby-gyms/nearby-gyms.component';
import { WeeklyActivityComponent } from '../../components/weekly-activity/weekly-activity.component';

@Component({
  selector: 'app-home-page',
  imports: [AppButton, UpcomingWorkoutsComponent, NearbyGymsComponent, WeeklyActivityComponent],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  private readonly homeService = inject(HomeService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);
  readonly workouts = signal(this.homeService.loadWorkouts());

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
          categoryLabel: isPersian ? 'تناسب اندام' : 'FITNESS',
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

  readonly nearbyGymsConfig = computed<NearbyGymsConfig>(() => {
    const isPersian = this.i18n.language() === 'fa';
    return {
      title: isPersian ? 'باشگاه‌های نزدیک شما' : 'Gyms near you',
      emptyLabel: isPersian
        ? 'برای دیدن باشگاه‌های نزدیک، مکان را فعال کنید.'
        : 'Enable location to discover nearby gyms.',
    };
  });

  readonly activityConfig = computed<WeeklyActivityConfig>(() => {
    const isPersian = this.i18n.language() === 'fa';
    const today = parseDateKey(getTodayDateKey());
    const day = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (day === 0 ? -6 : 1 - day));
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateKey = getDateKey(date);
      const exerciseCount = this.workouts()
        .filter((workout) => isWorkoutOnDate(workout, dateKey))
        .reduce((total, workout) => total + workout.exercises.length, 0);
      return {
        dateKey,
        dayLabel: date.toLocaleDateString(isPersian ? 'fa-IR-u-ca-persian' : undefined, {
          weekday: 'short',
        }),
        minutes: exerciseCount * 12,
        selected: dateKey === getTodayDateKey(),
      };
    });

    const totalMinutes = days.reduce((total, item) => total + item.minutes, 0);
    return {
      title: isPersian ? 'فعالیت‌ها' : 'Activities',
      periodLabel: isPersian ? 'هفتگی' : 'Weekly⌄',
      durationLabel: isPersian
        ? `${totalMinutes.toLocaleString('fa-IR')} دقیقه این هفته`
        : `${totalMinutes} minutes this week`,
      days,
    };
  });

  openWorkout(workoutId: string): void {
    void this.router.navigate(['/workouts/workout-detail', workoutId]);
  }

  openWorkoutPlanner(): void {
    void this.router.navigateByUrl('/workouts');
  }
}
