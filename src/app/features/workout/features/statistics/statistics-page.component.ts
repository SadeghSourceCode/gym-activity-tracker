import { Component, computed, inject, signal } from '@angular/core';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { DailyProgressComponent } from '../../components/daily-progress/daily-progress.component';
import { WeeklyCaloriesComponent } from '../../components/weekly-calories/weekly-calories.component';
import { WorkoutCalendarComponent } from '../../components/workout-calendar/workout-calendar.component';
import { WorkoutOverviewComponent } from '../../components/workout-overview/workout-overview.component';
import { DailyProgressConfig } from '../../data-access/models/daily-progress-config.interface';
import { WeeklyCaloriesConfig } from '../../data-access/models/weekly-calories-config.interface';
import { WorkoutCalendarConfig } from '../../data-access/models/workout-calendar-config.interface';
import { WorkoutOverviewConfig } from '../../data-access/models/workout-overview-config.interface';
import { StatisticsService } from '../../data-access/services/statistics.service';
import { WorkoutDashboardService } from '../../data-access/services/workout-dashboard.service';
import { getTodayDateKey, parseDateKey } from '../../utils/calendar-date.util';

@Component({
  selector: 'app-statistics-page',
  imports: [
    WorkoutCalendarComponent,
    WorkoutOverviewComponent,
    DailyProgressComponent,
    WeeklyCaloriesComponent,
  ],
  templateUrl: './statistics-page.component.html',
})
export class StatisticsPageComponent {
  private readonly statisticsService = inject(StatisticsService);
  private readonly dashboardService = inject(WorkoutDashboardService);
  readonly i18n = inject(I18nService);
  readonly selectedDate = signal(getTodayDateKey());
  readonly workouts = signal(this.statisticsService.loadWorkouts());
  readonly summary = computed(() =>
    this.dashboardService.createSummary(this.workouts(), this.selectedDate()),
  );

  readonly calendarConfig = computed<WorkoutCalendarConfig>(() => ({
    selectedDate: this.selectedDate(),
    workouts: this.workouts(),
  }));
  readonly overviewConfig = computed<WorkoutOverviewConfig>(() => {
    const fa = this.i18n.language() === 'fa';
    const summary = this.summary();
    return {
      title: fa ? 'نمای کلی' : 'Overview',
      items: [
        {
          label: fa ? 'کالری سوزانده‌شده' : 'Cal Burnt',
          value: summary.selectedDayCalories.toLocaleString(fa ? 'fa-IR' : undefined),
          icon: 'calories',
        },
        {
          label: fa ? 'زمان کل' : 'Total Time',
          value: this.formatDuration(summary.selectedDayDurationMinutes, fa),
          icon: 'time',
        },
        {
          label: fa ? 'تمرین‌ها' : 'Exercises',
          value: summary.selectedDayExerciseCount.toLocaleString(fa ? 'fa-IR' : undefined),
          icon: 'exercises',
        },
      ],
    };
  });
  readonly progressConfig = computed<DailyProgressConfig>(() => {
    const fa = this.i18n.language() === 'fa';
    const calories = this.summary().selectedDayCalories;
    return {
      title: fa ? 'پیشرفت روزانه' : 'Daily progress',
      metrics: [
        {
          label: fa ? 'خواب' : 'Sleep',
          value: 0,
          goal: 480,
          valueLabel: fa ? 'داده‌ای ثبت نشده' : 'No data / 8h',
          color: '#7DD3FC',
        },
        {
          label: fa ? 'کالری' : 'Calories',
          value: calories,
          goal: 600,
          valueLabel: `${calories}/600`,
          color: '#FB7185',
        },
        {
          label: fa ? 'قدم‌ها' : 'Steps',
          value: 0,
          goal: 6000,
          valueLabel: fa ? 'داده‌ای ثبت نشده' : 'No data / 6000',
          color: '#FDBA74',
        },
      ],
    };
  });
  readonly caloriesConfig = computed<WeeklyCaloriesConfig>(() => {
    const fa = this.i18n.language() === 'fa';
    return {
      title: fa ? 'کالری' : 'Calories',
      periodLabel: fa ? 'هفتگی' : 'Weekly⌄',
      caloriesUnit: fa ? 'کالری تخمینی تمرین' : 'Estimated workout calories',
      days: this.summary().weeklyCalories.map((day) => ({
        ...day,
        dayLabel: parseDateKey(day.dateKey).toLocaleDateString(
          fa ? 'fa-IR-u-ca-persian' : undefined,
          { weekday: 'short' },
        ),
        selected: day.dateKey === this.selectedDate(),
      })),
    };
  });

  private formatDuration(minutes: number, fa: boolean): string {
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    const value = hours ? `${hours}h ${remaining}min` : `${remaining}min`;
    return fa ? value.replace(/\d+/g, (part) => Number(part).toLocaleString('fa-IR')) : value;
  }
}
