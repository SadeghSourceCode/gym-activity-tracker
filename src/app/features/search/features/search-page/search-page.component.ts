import {
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  @ViewChild('loadMoreSentinel')
  set loadMoreSentinel(sentinel: ElementRef<HTMLElement> | undefined) {
    if (!this.isBrowser || !sentinel) {
      return;
    }

    this.loadMoreObserver?.disconnect();
    this.loadMoreObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.loadMoreWorkouts();
      }
    });
    this.loadMoreObserver.observe(sentinel.nativeElement);
  }

  private readonly exerciseDbApi = inject(ExerciseDbApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly resultLimit = 15;
  private loadMoreObserver?: IntersectionObserver;
  private searchRequestId = 0;

  readonly searchQuery = signal('');
  readonly workouts = signal<ExerciseDbExercise[]>([]);
  readonly totalWorkouts = signal(0);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedExercise = signal<ExerciseDbExercise | null>(null);
  readonly similarExercises = signal<ExerciseDbExercise[]>([]);

  readonly exerciseImageBaseUrl = this.exerciseDbApi.imageBaseUrl;

  constructor() {
    this.destroyRef.onDestroy(() => this.loadMoreObserver?.disconnect());
    this.searchWorkouts('');
  }

  searchWorkouts(query: string) {
    const requestId = ++this.searchRequestId;

    this.searchQuery.set(query);
    this.workouts.set([]);
    this.totalWorkouts.set(0);
    this.isLoading.set(true);
    this.isLoadingMore.set(false);
    this.error.set(null);

    this.exerciseDbApi
      .search(query, 0, this.resultLimit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items, total }) => {
          if (requestId !== this.searchRequestId) {
            return;
          }

          this.workouts.set(items);
          this.totalWorkouts.set(total);
          this.isLoading.set(false);
        },
        error: () => {
          if (requestId !== this.searchRequestId) {
            return;
          }

          this.workouts.set([]);
          this.totalWorkouts.set(0);
          this.error.set('Could not load workouts. Check your connection and try again.');
          this.isLoading.set(false);
        },
      });
  }

  loadMoreWorkouts() {
    if (
      this.isLoading() ||
      this.isLoadingMore() ||
      this.workouts().length >= this.totalWorkouts()
    ) {
      return;
    }

    const requestId = this.searchRequestId;
    const query = this.searchQuery();
    const offset = this.workouts().length;

    this.isLoadingMore.set(true);
    this.error.set(null);

    this.exerciseDbApi
      .search(query, offset, this.resultLimit)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items, total }) => {
          if (requestId !== this.searchRequestId) {
            return;
          }

          this.workouts.update((workouts) => [...workouts, ...items]);
          this.totalWorkouts.set(total);
          this.isLoadingMore.set(false);
        },
        error: () => {
          if (requestId !== this.searchRequestId) {
            return;
          }

          this.error.set('Could not load more workouts. Check your connection and try again.');
          this.isLoadingMore.set(false);
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
