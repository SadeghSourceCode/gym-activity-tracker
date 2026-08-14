import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import {
  Workout,
  WorkoutExerciseSection,
  WorkoutExerciseSummary,
} from '../../data-access/models/workout-storage.models';
import { AppButton } from '../../../../components/app-button/app-button';
import { ExerciseDbExercise } from '../../data-access/services/exercise-db-api.service';
import { WorkoutDetailConfig } from '../../data-access/models/workout-detail-config.interface';
import {
  WorkoutCompletedOutput,
  WorkoutExerciseOutput,
  WorkoutExerciseReplacedOutput,
  WorkoutSetUpdatedOutput,
} from '../../data-access/models/workout-detail-output.interface';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [AppButton],
  templateUrl: './workout-detail.component.html',
})
export class WorkoutDetailComponent {
  private readonly defaultRestSeconds = 60;
  private readonly destroyRef = inject(DestroyRef);
  private restTimerInterval: ReturnType<typeof setInterval> | undefined;
  private restNotificationTimeout: ReturnType<typeof setTimeout> | undefined;
  private restTimerEndsAt = 0;

  readonly exerciseSections: readonly WorkoutExerciseSection[] = ['warmup', 'main', 'cooldown'];
  readonly config = input.required<WorkoutDetailConfig>();
  readonly text = computed(() => this.config().text);
  readonly workout = computed<Workout>(() => this.config().workout);
  readonly canManage = computed(() => this.config().canManage ?? false);
  readonly replacingExerciseId = computed(() => this.config().replacingExerciseId ?? null);
  readonly replacementExercises = computed<readonly ExerciseDbExercise[]>(
    () => this.config().replacementExercises ?? [],
  );
  readonly replacementExercisesLoading = computed(
    () => this.config().replacementExercisesLoading ?? false,
  );
  readonly imageBaseUrl = computed(() => this.config().imageBaseUrl);

  readonly close = output<void>();
  readonly addSet = output<WorkoutExerciseOutput>();
  readonly removeExercise = output<WorkoutExerciseOutput>();
  readonly requestExerciseReplacement = output<WorkoutExerciseSummary>();
  readonly cancelExerciseReplacement = output<void>();
  readonly replaceExercise = output<WorkoutExerciseReplacedOutput>();
  readonly updateSet = output<WorkoutSetUpdatedOutput>();
  readonly complete = output<WorkoutCompletedOutput>();

  readonly expandedExerciseId = signal<string | null | undefined>(undefined);
  readonly restTimerSeconds = signal(0);
  readonly restTimerSetLabel = signal('');
  readonly isRestTimerOpen = signal(false);
  readonly isRestCompletionNotificationOpen = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearRestTimerInterval();
      this.clearRestNotificationTimeout();
    });
  }

  isExerciseExpanded(exerciseId: string): boolean {
    const expandedExerciseId = this.expandedExerciseId();

    if (expandedExerciseId === undefined) {
      return this.workout().exercises[0]?.id === exerciseId;
    }

    return expandedExerciseId === exerciseId;
  }

  toggleExercise(exerciseId: string) {
    this.expandedExerciseId.set(this.isExerciseExpanded(exerciseId) ? null : exerciseId);
  }

  getExerciseCountLabel(exerciseCount: number): string {
    return this.text().isPersian
      ? `${exerciseCount} حرکت`
      : `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  }

  getWorkoutExerciseName(exercise: WorkoutExerciseSummary): string {
    return this.text().isPersian ? exercise.nameFa : exercise.nameEn;
  }

  getSectionExercises(section: WorkoutExerciseSection): WorkoutExerciseSummary[] {
    return this.workout().exercises.filter((exercise) => {
      const exerciseSection =
        exercise.section === 'warmup' || exercise.section === 'cooldown'
          ? exercise.section
          : 'main';

      return exerciseSection === section;
    });
  }

  getSectionLabel(section: WorkoutExerciseSection): string {
    return section === 'warmup'
      ? this.text().warmupLabel
      : section === 'main'
        ? this.text().mainWorkoutLabel
        : this.text().cooldownLabel;
  }

  startRestTimer(exercise: WorkoutExerciseSummary, setIndex: number) {
    this.clearRestTimerInterval();
    this.clearRestNotificationTimeout();
    this.isRestCompletionNotificationOpen.set(false);
    this.restTimerSeconds.set(this.defaultRestSeconds);
    this.restTimerSetLabel.set(`${this.getWorkoutExerciseName(exercise)} · ${setIndex + 1}`);
    this.isRestTimerOpen.set(true);
    this.restTimerEndsAt = Date.now() + this.defaultRestSeconds * 1000;
    this.restTimerInterval = setInterval(() => this.updateRestTimer(), 250);
  }

  adjustRestTimer(seconds: number) {
    const nextSeconds = Math.max(this.restTimerSeconds() + seconds, 0);

    this.restTimerSeconds.set(nextSeconds);
    this.restTimerEndsAt = Date.now() + nextSeconds * 1000;

    if (nextSeconds > 0 && !this.restTimerInterval) {
      this.restTimerInterval = setInterval(() => this.updateRestTimer(), 250);
    } else if (nextSeconds === 0) {
      this.finishRestTimer();
    }
  }

  closeRestTimer() {
    this.clearRestTimerInterval();
    this.isRestTimerOpen.set(false);
    this.restTimerSeconds.set(0);
  }

  formatRestTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private updateRestTimer() {
    const secondsRemaining = Math.max(Math.ceil((this.restTimerEndsAt - Date.now()) / 1000), 0);

    this.restTimerSeconds.set(secondsRemaining);

    if (secondsRemaining === 0) {
      this.finishRestTimer();
    }
  }

  private finishRestTimer() {
    this.closeRestTimer();
    this.isRestCompletionNotificationOpen.set(true);
    this.clearRestNotificationTimeout();
    this.restNotificationTimeout = setTimeout(() => {
      this.isRestCompletionNotificationOpen.set(false);
      this.restNotificationTimeout = undefined;
    }, 5000);
  }

  private clearRestTimerInterval() {
    if (this.restTimerInterval) {
      clearInterval(this.restTimerInterval);
      this.restTimerInterval = undefined;
    }
  }

  private clearRestNotificationTimeout() {
    if (this.restNotificationTimeout) {
      clearTimeout(this.restNotificationTimeout);
      this.restNotificationTimeout = undefined;
    }
  }

  getExerciseMediaUrl(exercise: ExerciseDbExercise): string | null {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return mediaPath ? this.imageBaseUrl() + mediaPath : null;
  }
}
