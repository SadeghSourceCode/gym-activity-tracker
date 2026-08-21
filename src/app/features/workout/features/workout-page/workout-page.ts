import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  DailyWorkoutPlan,
  WorkoutCompletionStatus,
  WorkoutDisplayStatus,
} from '../../data-access/models/workout-planner.models';
import {
  Workout,
  WorkoutExerciseSummary,
  WorkoutSet,
} from '../../data-access/models/workout-storage.models';
import { Exercise } from '../../../exercise-library/data-access/models/exercise.models';
import { ExerciseLibraryService } from '../../../exercise-library/data-access/services/exercise-library.service';
import { getDateKey, getTodayDateKey, parseDateKey } from '../../utils/calendar-date.util';
import { saveCopiedWorkout } from '../../utils/workout-clipboard.util';
import { isWorkoutOnDate } from '../../utils/weekly-recurrence.util';
import { mapDailyPlanToViewModel } from '../../utils/workout-plan-view-model.mapper';
import { WorkoutCalendarComponent } from '../../components/workout-calendar/workout-calendar.component';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { SelectedDayPanelComponent } from '../../components/selected-day-panel/selected-day-panel.component';
import { ExerciseDetailsDialogComponent } from '../../components/exercise-details-dialog/exercise-details-dialog.component';
import { WeeklyCaloriesComponent } from '../../components/weekly-calories/weekly-calories.component';
import { DailyProgressComponent } from '../../components/daily-progress/daily-progress.component';
import { WorkoutOverviewComponent } from '../../components/workout-overview/workout-overview.component';
import { WorkoutDashboardService } from '../../data-access/services/workout-dashboard.service';
import { WeeklyCaloriesConfig } from '../../data-access/models/weekly-calories-config.interface';
import { DailyProgressConfig } from '../../data-access/models/daily-progress-config.interface';
import { WorkoutOverviewConfig } from '../../data-access/models/workout-overview-config.interface';
import { SelectedDayPanelConfig } from '../../data-access/models/selected-day-panel-config.interface';
import { ExerciseDetailsDialogConfig } from '../../data-access/models/exercise-details-dialog-config.interface';
import { WorkoutCalendarConfig } from '../../data-access/models/workout-calendar-config.interface';

@Component({
  selector: 'app-workout-page',
  imports: [
    WorkoutCalendarComponent,
    SelectedDayPanelComponent,
    ExerciseDetailsDialogComponent,
    WeeklyCaloriesComponent,
    DailyProgressComponent,
    WorkoutOverviewComponent,
  ],
  templateUrl: './workout-page.html',
})
export class WorkoutPage {
  private readonly storageKey = 'gym-activity-tracker.workouts';
  private readonly restDaysStorageKey = 'gym-activity-tracker.rest-days';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly exerciseLibrary = inject(ExerciseLibraryService);
  private readonly workoutDashboardService = inject(WorkoutDashboardService);
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);
  private readonly pageSize = 15;

  selectedDate = signal(getTodayDateKey());
  workouts = signal<Workout[]>(this.loadWorkouts());
  restDayKeys = signal<string[]>(this.loadRestDayKeys());
  selectedDayError = signal<string | null>(null);
  selectedExercise = signal<Exercise | null>(null);
  similarExercises = signal<Exercise[]>([]);
  exerciseDetailsError = signal<string | null>(null);

  readonly exerciseImageBaseUrl = this.exerciseLibrary.imageBaseUrl;
  readonly workoutCalendarConfig = computed<WorkoutCalendarConfig>(() => ({
    selectedDate: this.selectedDate(),
    workouts: this.workouts(),
  }));
  readonly selectedDayPlan = computed<DailyWorkoutPlan>(() =>
    this.getDailyPlan(this.selectedDate()),
  );
  readonly selectedDayViewModel = computed(() =>
    mapDailyPlanToViewModel(this.selectedDayPlan(), getTodayDateKey()),
  );
  readonly selectedDayWorkoutStatus = computed<WorkoutDisplayStatus | null>(() => {
    const viewModel = this.selectedDayViewModel();

    if (viewModel.type !== 'workout' || !viewModel.workouts.length) {
      return null;
    }

    const statuses = viewModel.workouts.map((workout) => workout.status);

    if (statuses.includes('in-progress')) {
      return 'in-progress';
    }

    if (statuses.includes('rejected')) {
      return 'rejected';
    }

    if (statuses.every((status) => status === 'done')) {
      return 'done';
    }

    return 'upcoming';
  });
  readonly dashboardSummary = computed(() =>
    this.workoutDashboardService.createSummary(this.workouts(), this.selectedDate()),
  );
  readonly weeklyCaloriesConfig = computed<WeeklyCaloriesConfig>(() => {
    const isPersian = this.i18n.language() === 'fa';

    return {
      title: isPersian ? 'کالری' : 'Calories',
      periodLabel: isPersian ? 'هفتگی' : 'Weekly',
      caloriesUnit: isPersian ? 'کالری تخمینی تمرین' : 'Estimated workout calories',
      days: this.dashboardSummary().weeklyCalories.map((day) => ({
        ...day,
        dayLabel: parseDateKey(day.dateKey).toLocaleDateString(
          isPersian ? 'fa-IR-u-ca-persian' : undefined,
          { weekday: 'short' },
        ),
        selected: day.dateKey === this.selectedDate(),
      })),
    };
  });
  readonly dailyProgressConfig = computed<DailyProgressConfig>(() => {
    const isPersian = this.i18n.language() === 'fa';
    const calories = this.dashboardSummary().selectedDayCalories;

    return {
      title: isPersian ? 'پیشرفت روزانه' : 'Daily progress',
      metrics: [
        {
          label: isPersian ? 'خواب' : 'Sleep',
          goal: 8,
          valueLabel: isPersian ? 'داده‌ای ثبت نشده' : 'No data recorded',
          color: '#7DD3FC',
        },
        {
          label: isPersian ? 'کالری' : 'Calories',
          value: calories,
          goal: 600,
          valueLabel: `${calories}/600`,
          color: '#FB7185',
        },
        {
          label: isPersian ? 'قدم‌ها' : 'Steps',
          goal: 6000,
          valueLabel: isPersian ? 'داده‌ای ثبت نشده' : 'No data recorded',
          color: '#FDBA74',
        },
      ],
    };
  });
  readonly workoutOverviewConfig = computed<WorkoutOverviewConfig>(() => {
    const isPersian = this.i18n.language() === 'fa';
    const summary = this.dashboardSummary();

    return {
      title: isPersian ? 'نمای کلی' : 'Overview',
      items: [
        {
          label: isPersian ? 'کالری سوزانده‌شده' : 'Calories burned',
          value: summary.selectedDayCalories.toLocaleString(isPersian ? 'fa-IR' : undefined),
          icon: 'calories',
        },
        {
          label: isPersian ? 'زمان کل' : 'Total time',
          value: this.formatDuration(summary.selectedDayDurationMinutes, isPersian),
          icon: 'time',
        },
        {
          label: isPersian ? 'تمرین‌ها' : 'Exercises',
          value: summary.selectedDayExerciseCount.toLocaleString(isPersian ? 'fa-IR' : undefined),
          icon: 'exercises',
        },
      ],
    };
  });
  readonly selectedDateLabel = computed(() =>
    parseDateKey(this.selectedDate()).toLocaleDateString(this.getDateLocale(), {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  );
  readonly selectedDayPanelConfig = computed<SelectedDayPanelConfig>(() => ({
    selectedDateLabel: this.selectedDateLabel(),
    selectedDayViewModel: this.selectedDayViewModel(),
    workoutStatus: this.selectedDayWorkoutStatus(),
    error: this.selectedDayError(),
    text: {
      selectedDayWorkoutsLabel: this.i18n.t('selectedDayWorkouts'),
      retryLabel: this.i18n.t('retry'),
      openLabel: this.i18n.t('open'),
      editLabel: this.i18n.t('edit'),
      deleteLabel: this.i18n.t('delete'),
      copyLabel: this.i18n.t('copy'),
      copiedLabel: this.i18n.t('copied'),
      restDayTitle: this.i18n.t('restDay'),
      recoveryMessage: this.i18n.t('recoveryMessage'),
      removeRestDayLabel: this.i18n.t('removeRestDay'),
      noWorkoutPlannedTitle: this.i18n.t('noWorkoutPlanned'),
      setWorkoutOrRestMessage: this.i18n.t('setWorkoutOrRest'),
      setWorkoutLabel: this.i18n.t('setWorkout'),
      markAsRestDayLabel: this.i18n.t('markAsRestDay'),
      inProgressLabel: this.i18n.t('inProgress'),
      doneLabel: this.i18n.t('done'),
      rejectedLabel: this.i18n.t('rejected'),
      incomingLabel: this.i18n.t('incoming'),
      workoutSummaryHeadingLabel: this.i18n.language() === 'fa' ? 'تمرین امروز' : "TODAY'S WORKOUT",
      startWorkoutLabel: this.i18n.language() === 'fa' ? 'شروع' : 'START',
      closeMenuLabel: this.i18n.language() === 'fa' ? 'بستن منو' : 'Close menu',
      estimatedLabel: this.i18n.language() === 'fa' ? 'تخمینی' : 'est.',
      minutesLabel: this.i18n.language() === 'fa' ? 'دقیقه' : 'min',
      moreExercisesLabel: this.i18n.language() === 'fa' ? 'حرکت دیگر' : 'more exercises',
      isPersian: this.i18n.language() === 'fa',
    },
  }));
  readonly exerciseDetailsConfig = computed<ExerciseDetailsDialogConfig | null>(() => {
    const exercise = this.selectedExercise();

    if (!exercise) {
      return null;
    }

    return {
      exercise,
      similarExercises: this.similarExercises(),
      imageBaseUrl: this.exerciseImageBaseUrl,
      text: {
        exerciseDetailsLabel: this.i18n.t('exerciseDetails'),
        closeExerciseDetailsLabel: this.i18n.t('closeExerciseDetails'),
        noDescriptionAvailableLabel: this.i18n.t('noDescriptionAvailable'),
        similarExercisesLabel: this.i18n.t('similarExercises'),
      },
    };
  });

  private loadWorkouts(): Workout[] {
    if (!this.isBrowser) {
      return [];
    }

    try {
      const storedWorkouts = localStorage.getItem(this.storageKey);

      if (!storedWorkouts) {
        return [];
      }

      const workouts = JSON.parse(storedWorkouts) as Workout[];

      if (!Array.isArray(workouts)) {
        return [];
      }

      return workouts.map((workout) => ({
        ...workout,
        schemaVersion: 2 as const,
        recurrence:
          workout.recurrence ??
          (workout.isWeeklyPlan
            ? { frequency: 'weekly' as const, interval: 1, occurrences: 4 }
            : undefined),
        date: new Date(workout.date),
        exercises: this.normalizeWorkoutExercises(workout),
        sets: Array.isArray(workout.sets) ? workout.sets : [],
        completionStatus: this.normalizeCompletionStatus(workout.completionStatus),
      }));
    } catch {
      return [];
    }
  }

  private loadRestDayKeys(): string[] {
    if (!this.isBrowser) {
      return [];
    }

    try {
      const storedRestDays = localStorage.getItem(this.restDaysStorageKey);

      if (!storedRestDays) {
        return [];
      }

      const restDays = JSON.parse(storedRestDays) as unknown;

      if (!Array.isArray(restDays)) {
        return [];
      }

      return restDays.filter((dateKey): dateKey is string => typeof dateKey === 'string');
    } catch {
      return [];
    }
  }

  selectDate(dateKey: string) {
    this.selectedDate.set(dateKey);
    this.selectedDayError.set(null);
  }

  openExerciseSheet() {
    if (!this.canManageSelectedDate()) {
      return;
    }

    void this.router.navigate(['/add-workout'], {
      queryParams: { date: this.selectedDate() },
    });
  }

  openEditWorkoutSheet(workoutId: string) {
    const workout = this.workouts().find((candidate) => candidate.id === Number(workoutId));

    if (!workout) {
      this.selectedDayError.set(this.i18n.t('couldNotFindWorkoutToEdit'));
      return;
    }

    if (!this.canManageWorkout(workout)) {
      return;
    }

    void this.router.navigate(['/add-workout'], {
      queryParams: { date: getDateKey(workout.date), editId: workout.id },
    });
  }

  copyWorkout(workoutId: string) {
    const workout = this.workouts().find((candidate) => candidate.id === Number(workoutId));

    if (!workout) {
      this.selectedDayError.set(this.i18n.t('couldNotFindWorkout'));
      return;
    }

    saveCopiedWorkout({
      name: workout.name,
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set })),
      })),
    });
  }

  openWorkoutDetails(workoutId: string) {
    const workout = this.workouts().find((candidate) => candidate.id === Number(workoutId));

    if (!workout) {
      this.selectedDayError.set(this.i18n.t('couldNotFindWorkout'));
      return;
    }

    void this.router.navigate(['/workout-detail', workout.id]);
  }

  setWorkoutCompletionStatus(
    workoutId: number,
    completionStatus: Extract<WorkoutCompletionStatus, 'completed' | 'rejected'>,
  ) {
    const targetWorkout = this.workouts().find((workout) => workout.id === workoutId);

    if (!targetWorkout || !this.canManageWorkout(targetWorkout)) {
      return;
    }

    this.workouts.update((workouts) =>
      workouts.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              completionStatus,
            }
          : workout,
      ),
    );
    this.saveWorkouts();
  }

  openExerciseDetails(workout: Workout) {
    if (!workout.exerciseId) {
      this.exerciseDetailsError.set('Exercise details are unavailable for this workout.');
      return;
    }

    this.exerciseDetailsError.set(null);

    this.exerciseLibrary
      .getById(workout.exerciseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (exercise) => {
          if (!exercise) {
            this.exerciseDetailsError.set('Exercise details were not found.');
            return;
          }

          this.showExerciseDetails(exercise);
        },
        error: () => {
          this.exerciseDetailsError.set('Could not load exercise details.');
        },
      });
  }

  showExerciseDetails(exercise: Exercise) {
    this.selectedExercise.set(exercise);
    this.exerciseDetailsError.set(null);

    this.exerciseLibrary
      .getSimilar(exercise)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (similarExercises) => this.similarExercises.set(similarExercises),
        error: () => this.similarExercises.set([]),
      });
  }

  closeExerciseDetails() {
    this.selectedExercise.set(null);
    this.similarExercises.set([]);
    this.exerciseDetailsError.set(null);
  }

  removeWorkout(workoutId: number) {
    const targetWorkout = this.workouts().find((workout) => workout.id === workoutId);

    if (!targetWorkout || !this.canManageWorkout(targetWorkout)) {
      return;
    }

    this.workouts.update((workouts) => workouts.filter((workout) => workout.id !== workoutId));
    this.saveWorkouts();
  }

  markSelectedDayAsRestDay() {
    if (!this.canManageSelectedDate()) {
      return;
    }

    const selectedDate = this.selectedDate();

    if (this.getWorkoutsForDate(selectedDate).length) {
      this.selectedDayError.set(this.i18n.t('removeWorkoutBeforeRest'));
      return;
    }

    this.selectedDayError.set(null);
    this.restDayKeys.update((dateKeys) =>
      dateKeys.includes(selectedDate) ? dateKeys : [...dateKeys, selectedDate],
    );
  }

  removeSelectedRestDay() {
    if (!this.canManageSelectedDate()) {
      return;
    }

    const selectedDate = this.selectedDate();

    this.selectedDayError.set(null);
    this.restDayKeys.update((dateKeys) => dateKeys.filter((dateKey) => dateKey !== selectedDate));
  }

  retrySelectedDay() {
    this.selectedDayError.set(null);
  }

  getWorkoutExerciseName(exercise: WorkoutExerciseSummary): string {
    return this.i18n.language() === 'fa' ? exercise.nameFa : exercise.nameEn;
  }

  private getDailyPlan(date: string): DailyWorkoutPlan {
    const workouts = this.getWorkoutsForDate(date).map((workout) => ({
      id: String(workout.id),
      title: workout.name,
      scheduledDate: date,
      exerciseCount: workout.exercises.length,
      estimatedMinutes: Math.max(workout.exercises.length * 12, 15),
      exercises: workout.exercises.map((exercise) => {
        const firstSet = exercise.sets[0];

        return {
          id: exercise.id,
          name: this.getWorkoutExerciseName(exercise),
          setCount: exercise.sets.length,
          weight: firstSet?.weightKg ?? 0,
        };
      }),
      completionStatus: this.normalizeCompletionStatus(workout.completionStatus),
    }));

    if (workouts.length) {
      return {
        date,
        type: 'workout',
        workouts,
      };
    }

    if (this.restDayKeys().includes(date)) {
      return {
        date,
        type: 'rest',
        workouts: [],
      };
    }

    return {
      date,
      type: 'empty',
      workouts: [],
    };
  }

  private getWorkoutsForDate(date: string): Workout[] {
    return this.workouts().filter((workout) => isWorkoutOnDate(workout, date));
  }

  private canManageSelectedDate(): boolean {
    return this.selectedDate() >= getTodayDateKey();
  }

  private canManageWorkout(workout: Workout): boolean {
    return getDateKey(workout.date) >= getTodayDateKey();
  }

  private normalizeCompletionStatus(
    completionStatus: WorkoutCompletionStatus | undefined,
  ): WorkoutCompletionStatus {
    if (
      completionStatus === 'pending' ||
      completionStatus === 'completed' ||
      completionStatus === 'rejected'
    ) {
      return completionStatus;
    }

    return 'pending';
  }

  private normalizeWorkoutExercises(workout: Workout): WorkoutExerciseSummary[] {
    if (Array.isArray(workout.exercises)) {
      return workout.exercises
        .filter(
          (exercise): exercise is WorkoutExerciseSummary =>
            typeof exercise?.id === 'string' && typeof exercise.name === 'string',
        )
        .map((exercise, order) => ({
          ...exercise,
          exerciseId: exercise.exerciseId ?? exercise.id,
          order,
          section:
            exercise.section === 'warmup' || exercise.section === 'cooldown'
              ? exercise.section
              : 'main',
          trackingType: exercise.trackingType ?? 'weight-and-repetitions',
          nameEn: exercise.nameEn ?? exercise.name,
          nameFa: exercise.nameFa ?? exercise.name,
          targetMuscle: exercise.targetMuscle ?? workout.targetMuscle,
          name:
            this.i18n.language() === 'fa'
              ? (exercise.nameFa ?? exercise.name)
              : (exercise.nameEn ?? exercise.name),
          sets: this.normalizeWorkoutSets(exercise.sets),
        }));
    }

    if (workout.exerciseId) {
      return [
        {
          id: `workout-exercise:${workout.id}:0`,
          exerciseId: workout.exerciseId,
          order: 0,
          section: 'main',
          trackingType: 'weight-and-repetitions',
          name: workout.name,
          nameEn: workout.name,
          nameFa: workout.name,
          targetMuscle: workout.targetMuscle,
          thumbnailUrl: workout.thumbnailUrl,
          sets: this.normalizeWorkoutSets(workout.sets),
        },
      ];
    }

    return [];
  }

  private normalizeWorkoutSets(sets: WorkoutSet[] | undefined): WorkoutSet[] {
    if (!Array.isArray(sets)) {
      return [{ id: 1, reps: 0, weightKg: 0 }];
    }

    const normalizedSets = sets
      .filter((set): set is WorkoutSet => typeof set?.id === 'number')
      .map((set) => {
        const legacy = set as WorkoutSet & { repeat?: number; weight?: number };
        return {
          ...set,
          reps: set.reps ?? legacy.repeat ?? 0,
          weightKg: set.weightKg ?? legacy.weight ?? 0,
        };
      });

    return normalizedSets.length ? normalizedSets : [{ id: 1, reps: 0, weightKg: 0 }];
  }

  private saveWorkouts() {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.workouts()));
    }
  }

  private getDateLocale(): string | undefined {
    return this.i18n.language() === 'fa' ? 'fa-IR' : undefined;
  }

  private formatDuration(minutes: number, isPersian: boolean): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const locale = isPersian ? 'fa-IR' : undefined;
    const localizedHours = hours.toLocaleString(locale);
    const localizedMinutes = remainingMinutes.toLocaleString(locale);

    if (!hours) {
      return isPersian ? `${localizedMinutes} دقیقه` : `${localizedMinutes} min`;
    }

    return isPersian
      ? `${localizedHours} ساعت ${localizedMinutes} دقیقه`
      : `${localizedHours}h ${localizedMinutes}min`;
  }
}
