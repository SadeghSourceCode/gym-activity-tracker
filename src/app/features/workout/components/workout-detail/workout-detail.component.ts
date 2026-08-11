import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import {
  Workout,
  WorkoutExerciseSection,
  WorkoutExerciseSummary,
  WorkoutSet,
} from '../../models/workout-storage.models';
import { WorkoutCompletionStatus } from '../../models/workout-planner.models';
import { WorkoutDetailTextConfig } from '../../models/workout-ui.models';
import { AppButton } from '../../../../components/app-button/app-button';
import { ExerciseDbExercise } from '../../services/exercise-db-api.service';

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
  readonly text = input.required<WorkoutDetailTextConfig>();
  readonly workout = input.required<Workout>();
  readonly canManage = input.required<boolean>();
  readonly replacingExerciseId = input<string | null>(null);
  readonly replacementExercises = input<ExerciseDbExercise[]>([]);
  readonly replacementExercisesLoading = input(false);
  readonly imageBaseUrl = input.required<string>();

  readonly close = output<void>();
  readonly addSet = output<{ workoutId: number; exerciseId: string }>();
  readonly removeExercise = output<{ workoutId: number; exerciseId: string }>();
  readonly requestExerciseReplacement = output<WorkoutExerciseSummary>();
  readonly cancelExerciseReplacement = output<void>();
  readonly replaceExercise = output<{
    workoutId: number;
    exerciseId: string;
    replacement: ExerciseDbExercise;
  }>();
  readonly updateSet = output<{
    workoutId: number;
    exerciseId: string;
    setId: number;
    changes: Partial<Pick<WorkoutSet, 'repeat' | 'weight'>>;
  }>();
  readonly complete = output<{
    workoutId: number;
    completionStatus: Extract<WorkoutCompletionStatus, 'completed' | 'rejected'>;
  }>();

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
