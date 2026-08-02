import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ExerciseDbApiService,
  ExerciseDbExercise,
} from '../../../workout/services/exercise-db-api.service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  templateUrl: './search-page.component.html',
})
export class SearchPageComponent {
  private readonly exerciseDbApi = inject(ExerciseDbApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly resultLimit = 10;

  readonly searchQuery = signal('');
  readonly workouts = signal<ExerciseDbExercise[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedExercise = signal<ExerciseDbExercise | null>(null);
  readonly similarExercises = signal<ExerciseDbExercise[]>([]);

  readonly exerciseImageBaseUrl = this.exerciseDbApi.imageBaseUrl;

  constructor() {
    this.searchWorkouts('');
  }

  searchWorkouts(query: string) {
    this.searchQuery.set(query);
    this.isLoading.set(true);
    this.error.set(null);

    this.exerciseDbApi
      .search(query, 0, this.resultLimit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items }) => {
          this.workouts.set(items);
          this.isLoading.set(false);
        },
        error: () => {
          this.workouts.set([]);
          this.error.set('Could not load workouts. Check your connection and try again.');
          this.isLoading.set(false);
        },
      });
  }

  getExerciseMediaUrl(exercise: ExerciseDbExercise): string | null {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return mediaPath ? this.exerciseImageBaseUrl + mediaPath : null;
  }

  showExerciseDetails(exercise: ExerciseDbExercise) {
    this.selectedExercise.set(exercise);

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
  }
}
