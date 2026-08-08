import { isPlatformBrowser, Location } from '@angular/common';
import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AppButton } from '../../../../components/app-button/app-button';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { WorkoutCompletionStatus } from '../../models/workout-planner.models';
import {
  Workout,
  WorkoutExerciseSummary,
  WorkoutSet,
} from '../../models/workout-storage.models';
import { WorkoutDetailTextConfig } from '../../models/workout-ui.models';
import {
  ExerciseDbApiService,
  ExerciseDbExercise,
} from '../../services/exercise-db-api.service';
import { getDateKey, getTodayDateKey } from '../../utils/calendar-date.util';
import { WorkoutDetailComponent } from '../../components/workout-detail/workout-detail.component';

@Component({
  selector: 'app-workout-detail-page',
  standalone: true,
  imports: [WorkoutDetailComponent, AppButton],
  templateUrl: './workout-detail-page.html',
})
export class WorkoutDetailPage {
  private readonly storageKey = 'gym-activity-tracker.workouts';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly exerciseDbApi = inject(ExerciseDbApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  readonly i18n = inject(I18nService);

  private readonly workoutId = Number(this.route.snapshot.paramMap.get('id'));

  readonly workouts = signal<Workout[]>(this.loadWorkouts());
  readonly workout = computed(() =>
    this.workouts().find((candidate) => candidate.id === this.workoutId) ?? null,
  );
  readonly workoutError = signal<string | null>(null);
  readonly canManage = computed(() => {
    const workout = this.workout();

    return workout ? getDateKey(workout.date) >= getTodayDateKey() : false;
  });
  readonly replacingExerciseId = signal<string | null>(null);
  readonly replacementExercises = signal<ExerciseDbExercise[]>([]);
  readonly replacementExercisesLoading = signal(false);

  readonly exerciseImageBaseUrl = this.exerciseDbApi.imageBaseUrl;

  readonly workoutDetailText = computed<WorkoutDetailTextConfig>(() => ({
    workoutDetailsLabel: this.i18n.t('workoutDetails'),
    closeWorkoutDetailsLabel: this.i18n.t('closeWorkoutDetails'),
    repeatLabel: this.i18n.t('repeat'),
    weightLabel: this.i18n.t('weight'),
    addSetLabel: this.i18n.t('addSet'),
    changeExerciseLabel: this.i18n.t('changeExercise'),
    removeExerciseLabel: this.i18n.t('removeExercise'),
    chooseReplacementLabel: this.i18n.t('chooseReplacement'),
    noSimilarExercisesLabel: this.i18n.t('noSimilarExercises'),
    loadingExercisesLabel: this.i18n.t('loadingExercises'),
    markAsDoneLabel: this.i18n.t('markAsDone'),
    rejectWorkoutLabel: this.i18n.t('rejectWorkout'),
    isPersian: this.i18n.language() === 'fa',
  }));

  constructor() {
    if (!this.workout()) {
      this.workoutError.set(this.i18n.t('couldNotFindWorkout'));
    }
  }

  goBack() {
    this.location.back();
  }

  requestExerciseReplacement(exercise: WorkoutExerciseSummary) {
    const workout = this.workout();

    if (!workout || !this.canManage()) {
      return;
    }

    this.replacingExerciseId.set(exercise.id);
    this.replacementExercises.set([]);
    this.replacementExercisesLoading.set(true);

    this.exerciseDbApi
      .getById(exercise.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sourceExercise) => {
          if (!sourceExercise || this.replacingExerciseId() !== exercise.id) {
            this.replacementExercisesLoading.set(false);
            return;
          }

          this.exerciseDbApi
            .getSimilar(sourceExercise, 12)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (relatedExercises) => {
                if (this.replacingExerciseId() === exercise.id) {
                  this.replacementExercises.set(relatedExercises);
                  this.replacementExercisesLoading.set(false);
                }
              },
              error: () => this.finishReplacementLoading(exercise.id),
            });
        },
        error: () => this.finishReplacementLoading(exercise.id),
      });
  }

  cancelExerciseReplacement() {
    this.replacingExerciseId.set(null);
    this.replacementExercises.set([]);
    this.replacementExercisesLoading.set(false);
  }

  removeExercise(workoutId: number, exerciseId: string) {
    const targetWorkout = this.workouts().find((workout) => workout.id === workoutId);

    if (!targetWorkout || !this.canManage()) {
      return;
    }

    if (targetWorkout.exercises.length === 1) {
      this.workouts.update((workouts) =>
        workouts.filter((workout) => workout.id !== workoutId),
      );
      this.saveWorkouts();
      this.goBack();
      return;
    }

    this.workouts.update((workouts) =>
      workouts.map((workout) => {
        if (workout.id !== workoutId) {
          return workout;
        }

        const exercises = workout.exercises.filter((exercise) => exercise.id !== exerciseId);
        const firstExercise = exercises[0];

        return {
          ...workout,
          exercises,
          exerciseId: firstExercise.id,
          thumbnailUrl: firstExercise.thumbnailUrl,
          targetMuscle: firstExercise.targetMuscle,
        };
      }),
    );
    this.cancelExerciseReplacement();
    this.saveWorkouts();
  }

  replaceExercise(workoutId: number, exerciseId: string, replacement: ExerciseDbExercise) {
    const targetWorkout = this.workouts().find((workout) => workout.id === workoutId);

    if (!targetWorkout || !this.canManage()) {
      return;
    }

    this.workouts.update((workouts) =>
      workouts.map((workout) => {
        if (workout.id !== workoutId) {
          return workout;
        }

        const exercises = workout.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? {
                ...exercise,
                id: replacement.id,
                name: replacement.name,
                nameEn: replacement.nameEn,
                nameFa: replacement.nameFa,
                targetMuscle: replacement.targetMuscle,
                thumbnailUrl: this.getExerciseMediaUrl(replacement) ?? undefined,
              }
            : exercise,
        );
        const firstExercise = exercises[0];

        return {
          ...workout,
          exercises,
          exerciseId: firstExercise.id,
          thumbnailUrl: firstExercise.thumbnailUrl,
          targetMuscle: firstExercise.targetMuscle,
        };
      }),
    );
    this.cancelExerciseReplacement();
    this.saveWorkouts();
  }

  addSet(workoutId: number, exerciseId: string) {
    const targetWorkout = this.workouts().find((workout) => workout.id === workoutId);

    if (!targetWorkout || !this.canManage()) {
      return;
    }

    this.workouts.update((workouts) =>
      workouts.map((workout) => {
        if (workout.id !== workoutId) {
          return workout;
        }

        return {
          ...workout,
          exercises: workout.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) {
              return exercise;
            }

            const nextSetId = Math.max(...exercise.sets.map((set) => set.id), 0) + 1;

            return {
              ...exercise,
              sets: [
                ...exercise.sets,
                {
                  id: nextSetId,
                  repeat: 0,
                  weight: 0,
                },
              ],
            };
          }),
        };
      }),
    );
    this.saveWorkouts();
  }

  updateSet(
    workoutId: number,
    exerciseId: string,
    setId: number,
    changes: Partial<Pick<WorkoutSet, 'repeat' | 'weight'>>,
  ) {
    const targetWorkout = this.workouts().find((workout) => workout.id === workoutId);

    if (!targetWorkout || !this.canManage()) {
      return;
    }

    this.workouts.update((workouts) =>
      workouts.map((workout) => {
        if (workout.id !== workoutId) {
          return workout;
        }

        return {
          ...workout,
          exercises: workout.exercises.map((exercise) =>
            exercise.id === exerciseId
              ? {
                  ...exercise,
                  sets: exercise.sets.map((set) =>
                    set.id === setId ? { ...set, ...changes } : set,
                  ),
                }
              : exercise,
          ),
        };
      }),
    );
    this.saveWorkouts();
  }

  complete(
    workoutId: number,
    completionStatus: Extract<WorkoutCompletionStatus, 'completed' | 'rejected'>,
  ) {
    const targetWorkout = this.workouts().find((workout) => workout.id === workoutId);

    if (!targetWorkout || !this.canManage()) {
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
    this.goBack();
  }

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

  private saveWorkouts() {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.workouts()));
    }
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
        .map((exercise) => ({
          ...exercise,
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
          id: workout.exerciseId,
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
      return [{ id: 1, repeat: 0, weight: 0 }];
    }

    const normalizedSets = sets.filter(
      (set): set is WorkoutSet =>
        typeof set?.id === 'number' &&
        typeof set.repeat === 'number' &&
        typeof set.weight === 'number',
    );

    return normalizedSets.length ? normalizedSets : [{ id: 1, repeat: 0, weight: 0 }];
  }

  private getExerciseMediaUrl(exercise: ExerciseDbExercise): string | null {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return mediaPath ? this.exerciseImageBaseUrl + mediaPath : null;
  }

  private finishReplacementLoading(exerciseId: string) {
    if (this.replacingExerciseId() === exerciseId) {
      this.replacementExercises.set([]);
      this.replacementExercisesLoading.set(false);
    }
  }
}
