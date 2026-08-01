import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ExerciseDbApiService,
  ExerciseDbExercise,
} from '../../services/exercise-db-api.service';

interface WorkoutSet {
  id: number;
  repeat: number;
  weight: number;
}

interface Workout {
  id: number;
  name: string;
  exerciseId?: string;
  thumbnailUrl?: string;
  date: Date;
  sets: WorkoutSet[];
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
})
export class MainComponent {
  private readonly storageKey = 'gym-activity-tracker.workouts';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly exerciseDbApi = inject(ExerciseDbApiService);
  private readonly pageSize = 15;

  workouts = signal<Workout[]>(this.loadWorkouts());
  isExerciseSheetOpen = signal(false);
  exerciseSearchQuery = signal('');
  exerciseSearchResults = signal<ExerciseDbExercise[]>([]);
  exerciseSearchTotal = signal(0);
  isExerciseSearchLoading = signal(false);
  exerciseSearchError = signal<string | null>(null);
  selectedExercise = signal<ExerciseDbExercise | null>(null);
  similarExercises = signal<ExerciseDbExercise[]>([]);
  exerciseDetailsError = signal<string | null>(null);

  readonly exerciseImageBaseUrl = this.exerciseDbApi.imageBaseUrl;

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
        sets: Array.isArray(workout.sets) ? workout.sets : [],
      }));
    } catch {
      return [];
    }
  }

  openExerciseSheet() {
    this.isExerciseSheetOpen.set(true);
    this.searchExercises('');
  }

  closeExerciseSheet() {
    this.isExerciseSheetOpen.set(false);
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

  addWorkout(exercise?: ExerciseDbExercise) {
    this.workouts.update((workouts) => {
      const nextWorkoutId = Math.max(...workouts.map((workout) => workout.id), 0) + 1;

      return [
        ...workouts,
        {
          id: nextWorkoutId,
          name: exercise?.name ?? `workout ${nextWorkoutId}`,
          exerciseId: exercise?.id,
          thumbnailUrl: exercise ? (this.getExerciseMediaUrl(exercise) ?? undefined) : undefined,
          date: new Date(),
          sets: [{ id: 1, repeat: 0, weight: 0 }],
        },
      ];
    });

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
}
