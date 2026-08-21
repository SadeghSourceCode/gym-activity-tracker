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
import { Exercise } from '../../../exercise-library/data-access/models/exercise.models';
import { ExerciseLibraryService } from '../../../exercise-library/data-access/services/exercise-library.service';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { AppButton } from '../../../../components/app-button/app-button';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [AppButton],
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

  private readonly exerciseLibrary = inject(ExerciseLibraryService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly i18n = inject(I18nService);
  private readonly resultLimit = 15;
  private loadMoreObserver?: IntersectionObserver;
  private searchRequestId = 0;

  readonly searchQuery = signal('');
  readonly workouts = signal<Exercise[]>([]);
  readonly totalWorkouts = signal(0);
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedExercise = signal<Exercise | null>(null);
  readonly similarExercises = signal<Exercise[]>([]);

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

    this.exerciseLibrary
      .search({ text: query, offset: 0, limit: this.resultLimit })
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
          this.error.set(this.i18n.t('couldNotLoadWorkouts'));
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

    this.exerciseLibrary
      .search({ text: query, offset, limit: this.resultLimit })
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

          this.error.set(this.i18n.t('couldNotLoadMoreWorkouts'));
          this.isLoadingMore.set(false);
        },
      });
  }

  getExerciseMediaUrl(exercise: Exercise): string | null {
    return this.exerciseLibrary.getMediaUrl(exercise);
  }

  showExerciseDetails(exercise: Exercise) {
    this.selectedExercise.set(exercise);

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
  }
}
