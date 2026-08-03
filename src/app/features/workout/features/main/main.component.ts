import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  DailyWorkoutPlan,
  WorkoutCompletionStatus,
  WorkoutDisplayStatus,
} from '../../models/workout-planner.models';
import {
  ExerciseDbApiService,
  ExerciseDbExercise,
} from '../../services/exercise-db-api.service';
import { getDateKey, getTodayDateKey, parseDateKey } from '../../utils/calendar-date.util';
import { mapDailyPlanToViewModel } from '../../utils/workout-plan-view-model.mapper';
import { WORKOUT_STATUS_LABELS } from '../../utils/workout-status.util';
import { WorkoutCalendarComponent } from '../workout-calendar/workout-calendar.component';

interface WorkoutSet {
  id: number;
  repeat: number;
  weight: number;
}

interface WorkoutExerciseSummary {
  id: string;
  name: string;
  thumbnailUrl?: string;
}

interface Workout {
  id: number;
  name: string;
  exerciseId?: string;
  thumbnailUrl?: string;
  exercises: WorkoutExerciseSummary[];
  date: Date;
  sets: WorkoutSet[];
  completionStatus?: WorkoutCompletionStatus;
}

@Component({
  selector: 'app-main',
  imports: [WorkoutCalendarComponent],
  templateUrl: './main.component.html',
})
export class MainComponent {
  private readonly storageKey = 'gym-activity-tracker.workouts';
  private readonly restDaysStorageKey = 'gym-activity-tracker.rest-days';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly exerciseDbApi = inject(ExerciseDbApiService);
  private readonly pageSize = 15;

  selectedDate = signal(getTodayDateKey());
  workouts = signal<Workout[]>(this.loadWorkouts());
  restDayKeys = signal<string[]>(this.loadRestDayKeys());
  selectedDayError = signal<string | null>(null);
  isExerciseSheetOpen = signal(false);
  exerciseSearchQuery = signal('');
  exerciseSearchResults = signal<ExerciseDbExercise[]>([]);
  exerciseSearchTotal = signal(0);
  isExerciseSearchLoading = signal(false);
  exerciseSearchError = signal<string | null>(null);
  selectedWorkoutExercises = signal<WorkoutExerciseSummary[]>([]);
  selectedExercise = signal<ExerciseDbExercise | null>(null);
  similarExercises = signal<ExerciseDbExercise[]>([]);
  exerciseDetailsError = signal<string | null>(null);

  readonly exerciseImageBaseUrl = this.exerciseDbApi.imageBaseUrl;
  readonly selectedDayPlan = computed<DailyWorkoutPlan>(() => this.getDailyPlan(this.selectedDate()));
  readonly selectedDayViewModel = computed(() =>
    mapDailyPlanToViewModel(this.selectedDayPlan(), getTodayDateKey()),
  );
  readonly selectedDateLabel = computed(() =>
    parseDateKey(this.selectedDate()).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  );

  private readonly saveWorkouts = effect(() => {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.workouts()));
    } catch {
      // Keep the app usable when storage is unavailable or full.
    }
  });

  private readonly saveRestDayKeys = effect(() => {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(this.restDaysStorageKey, JSON.stringify(this.restDayKeys()));
    } catch {
      this.selectedDayError.set('Could not save rest-day changes.');
    }
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
    this.selectedWorkoutExercises.set([]);
    this.isExerciseSheetOpen.set(true);
    this.searchExercises('');
  }

  closeExerciseSheet() {
    this.isExerciseSheetOpen.set(false);
    this.selectedWorkoutExercises.set([]);
  }

  searchExercises(query: string) {
    this.exerciseSearchQuery.set(query);
    this.exerciseSearchResults.set([]);
    this.exerciseSearchTotal.set(0);
    this.loadExercisesPage(0);
  }

  loadMoreExercises() {
    if (
      this.isExerciseSearchLoading() ||
      this.exerciseSearchResults().length >= this.exerciseSearchTotal()
    ) {
      return;
    }

    this.loadExercisesPage(this.exerciseSearchResults().length);
  }

  onExerciseListScroll(event: Event) {
    const target = event.target as HTMLElement;
    const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (remainingScroll < 240) {
      this.loadMoreExercises();
    }
  }

  toggleWorkoutExercise(exercise: ExerciseDbExercise) {
    const exerciseSummary = this.toWorkoutExerciseSummary(exercise);

    this.selectedWorkoutExercises.update((selectedExercises) =>
      selectedExercises.some((selectedExercise) => selectedExercise.id === exercise.id)
        ? selectedExercises.filter((selectedExercise) => selectedExercise.id !== exercise.id)
        : [...selectedExercises, exerciseSummary],
    );
  }

  isWorkoutExerciseSelected(exerciseId: string): boolean {
    return this.selectedWorkoutExercises().some((exercise) => exercise.id === exerciseId);
  }

  removeSelectedWorkoutExercise(exerciseId: string) {
    this.selectedWorkoutExercises.update((selectedExercises) =>
      selectedExercises.filter((exercise) => exercise.id !== exerciseId),
    );
  }

  createWorkoutFromSelectedExercises() {
    const selectedExercises = this.selectedWorkoutExercises();

    if (!selectedExercises.length) {
      this.exerciseSearchError.set('Select at least one exercise to create a workout.');
      return;
    }

    this.workouts.update((workouts) => {
      const nextWorkoutId = Math.max(...workouts.map((workout) => workout.id), 0) + 1;
      const firstExercise = selectedExercises[0];

      return [
        ...workouts,
        {
          id: nextWorkoutId,
          name:
            selectedExercises.length === 1
              ? firstExercise.name
              : `${firstExercise.name} + ${selectedExercises.length - 1} more`,
          exerciseId: firstExercise.id,
          thumbnailUrl: firstExercise.thumbnailUrl,
          exercises: selectedExercises,
          date: parseDateKey(this.selectedDate()),
          completionStatus: 'pending',
          sets: [{ id: 1, repeat: 0, weight: 0 }],
        },
      ];
    });

    this.restDayKeys.update((dateKeys) =>
      dateKeys.filter((dateKey) => dateKey !== this.selectedDate()),
    );
    this.closeExerciseSheet();
  }

  getExerciseMediaUrl(exercise: ExerciseDbExercise): string | null {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return mediaPath ? this.exerciseImageBaseUrl + mediaPath : null;
  }

  openExerciseDetails(workout: Workout) {
    if (!workout.exerciseId) {
      this.exerciseDetailsError.set('Exercise details are unavailable for this workout.');
      return;
    }

    this.exerciseDetailsError.set(null);

    this.exerciseDbApi
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

  showExerciseDetails(exercise: ExerciseDbExercise) {
    this.selectedExercise.set(exercise);
    this.exerciseDetailsError.set(null);

    this.exerciseDbApi
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
    this.workouts.update((workouts) =>
      workouts.filter((workout) => workout.id !== workoutId),
    );
  }

  markSelectedDayAsRestDay() {
    const selectedDate = this.selectedDate();

    if (this.getWorkoutsForDate(selectedDate).length) {
      this.selectedDayError.set('Remove this day’s workouts before marking it as a rest day.');
      return;
    }

    this.selectedDayError.set(null);
    this.restDayKeys.update((dateKeys) =>
      dateKeys.includes(selectedDate) ? dateKeys : [...dateKeys, selectedDate],
    );
  }

  removeSelectedRestDay() {
    const selectedDate = this.selectedDate();

    this.selectedDayError.set(null);
    this.restDayKeys.update((dateKeys) =>
      dateKeys.filter((dateKey) => dateKey !== selectedDate),
    );
  }

  retrySelectedDay() {
    this.selectedDayError.set(null);
  }

  getStatusLabel(status: WorkoutDisplayStatus): string {
    return WORKOUT_STATUS_LABELS[status];
  }

  getExerciseCountLabel(exerciseCount: number): string {
    return `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  }

  addSet(workoutId: number) {
    this.workouts.update((workouts) =>
      workouts.map((workout) => {
        if (workout.id !== workoutId) {
          return workout;
        }

        const nextSetId = Math.max(...workout.sets.map((set) => set.id), 0) + 1;

        return {
          ...workout,
          sets: [
            ...workout.sets,
            {
              id: nextSetId,
              repeat: 0,
              weight: 0,
            },
          ],
        };
      }),
    );
  }

  updateSet(
    workoutId: number,
    setId: number,
    changes: Partial<Pick<WorkoutSet, 'repeat' | 'weight'>>,
  ) {
    this.workouts.update((workouts) =>
      workouts.map((workout) => {
        if (workout.id !== workoutId) {
          return workout;
        }

        return {
          ...workout,
          sets: workout.sets.map((set) => (set.id === setId ? { ...set, ...changes } : set)),
        };
      }),
    );
  }

  private loadExercisesPage(offset: number) {
    this.isExerciseSearchLoading.set(true);
    this.exerciseSearchError.set(null);

    this.exerciseDbApi
      .search(this.exerciseSearchQuery(), offset, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items, total }) => {
          this.exerciseSearchResults.update((results) =>
            offset === 0 ? items : [...results, ...items],
          );
          this.exerciseSearchTotal.set(total);
          this.isExerciseSearchLoading.set(false);
        },
        error: () => {
          this.exerciseSearchError.set('Could not load exercises. Check your connection and try again.');
          this.isExerciseSearchLoading.set(false);
        },
      });
  }

  private getDailyPlan(date: string): DailyWorkoutPlan {
    const workouts = this.getWorkoutsForDate(date).map((workout) => ({
      id: String(workout.id),
      title: workout.name,
      scheduledDate: getDateKey(workout.date),
      exerciseCount: workout.exercises.length,
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
    return this.workouts().filter((workout) => getDateKey(workout.date) === date);
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
      return workout.exercises.filter(
        (exercise): exercise is WorkoutExerciseSummary =>
          typeof exercise?.id === 'string' && typeof exercise.name === 'string',
      );
    }

    if (workout.exerciseId) {
      return [
        {
          id: workout.exerciseId,
          name: workout.name,
          thumbnailUrl: workout.thumbnailUrl,
        },
      ];
    }

    return [];
  }

  private toWorkoutExerciseSummary(exercise: ExerciseDbExercise): WorkoutExerciseSummary {
    return {
      id: exercise.id,
      name: exercise.name,
      thumbnailUrl: this.getExerciseMediaUrl(exercise) ?? undefined,
    };
  }
}
