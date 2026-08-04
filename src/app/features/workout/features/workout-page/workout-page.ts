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
  Workout,
  WorkoutExerciseSummary,
  WorkoutSet,
} from '../../models/workout-storage.models';
import {
  ExerciseDetailsTextConfig,
  SelectedDayPanelTextConfig,
  WorkoutDetailTextConfig,
  WorkoutEditorTextConfig,
} from '../../models/workout-ui.models';
import {
  ExerciseDbApiService,
  ExerciseDbExercise,
  TargetMuscleOption,
} from '../../services/exercise-db-api.service';
import { getDateKey, getTodayDateKey, parseDateKey } from '../../utils/calendar-date.util';
import { mapDailyPlanToViewModel } from '../../utils/workout-plan-view-model.mapper';
import { WorkoutCalendarComponent } from '../../components/workout-calendar/workout-calendar.component';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { SelectedDayPanelComponent } from '../../components/selected-day-panel/selected-day-panel.component';
import {
  WorkoutEditorSheetComponent,
  WorkoutEditorStep,
} from '../../components/workout-editor-sheet/workout-editor-sheet.component';
import { WorkoutDetailComponent } from '../../components/workout-detail/workout-detail.component';
import { ExerciseDetailsDialogComponent } from '../../components/exercise-details-dialog/exercise-details-dialog.component';

@Component({
  selector: 'app-workout-page',
  imports: [
    WorkoutCalendarComponent,
    SelectedDayPanelComponent,
    WorkoutEditorSheetComponent,
    WorkoutDetailComponent,
    ExerciseDetailsDialogComponent,
  ],
  templateUrl: './workout-page.html',
})
export class WorkoutPage {
  private readonly storageKey = 'gym-activity-tracker.workouts';
  private readonly restDaysStorageKey = 'gym-activity-tracker.rest-days';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly exerciseDbApi = inject(ExerciseDbApiService);
  readonly i18n = inject(I18nService);
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
  targetMuscles = signal<TargetMuscleOption[]>([]);
  selectedTargetMuscle = signal<string | null>(null);
  workoutEditorStep = signal<WorkoutEditorStep>('muscle');
  isWeeklyPlan = signal(false);
  editingWorkoutId = signal<number | null>(null);
  workoutTitle = signal('');
  selectedWorkoutExercises = signal<WorkoutExerciseSummary[]>([]);
  openedWorkoutId = signal<number | null>(null);
  openedWorkout = computed(() => {
    const openedWorkoutId = this.openedWorkoutId();

    if (openedWorkoutId === null) {
      return null;
    }

    return this.workouts().find((workout) => workout.id === openedWorkoutId) ?? null;
  });
  selectedExercise = signal<ExerciseDbExercise | null>(null);
  similarExercises = signal<ExerciseDbExercise[]>([]);
  exerciseDetailsError = signal<string | null>(null);

  readonly exerciseImageBaseUrl = this.exerciseDbApi.imageBaseUrl;
  readonly selectedDayPlan = computed<DailyWorkoutPlan>(() => this.getDailyPlan(this.selectedDate()));
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
  readonly selectedDateLabel = computed(() =>
    parseDateKey(this.selectedDate()).toLocaleDateString(this.getDateLocale(), {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  );
  readonly selectedDayPanelText = computed<SelectedDayPanelTextConfig>(() => ({
    selectedDayWorkoutsLabel: this.i18n.t('selectedDayWorkouts'),
    retryLabel: this.i18n.t('retry'),
    openLabel: this.i18n.t('open'),
    rejectLabel: this.i18n.t('reject'),
    editLabel: this.i18n.t('edit'),
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
    isPersian: this.i18n.language() === 'fa',
  }));
  readonly workoutEditorText = computed<WorkoutEditorTextConfig>(() => ({
    addWorkoutLabel: this.i18n.t('addWorkout'),
    closeExerciseSearchLabel: this.i18n.t('closeExerciseSearch'),
    selectExerciseForDateLabel: this.i18n.t('selectExerciseForDate'),
    workoutTitleLabel: this.i18n.t('workoutTitle'),
    leaveEmptyToUseLabel: this.i18n.t('leaveEmptyToUse'),
    searchExercisesLabel: this.i18n.t('searchExercises'),
    searchByNameMuscleEquipmentLabel: this.i18n.t('searchByNameMuscleEquipment'),
    selectedExercisesLabel: this.i18n.t('selectedExercises'),
    removeLabel: this.i18n.t('remove'),
    selectedLabel: this.i18n.t('selected'),
    loadingExercisesLabel: this.i18n.t('loadingExercises'),
    loadMoreLabel: this.i18n.t('loadMore'),
    noExercisesFoundLabel: this.i18n.t('noExercisesFound'),
    backLabel: this.i18n.t('back'),
    continueLabel: this.i18n.t('continue'),
    targetMuscleLabel: this.i18n.t('targetMuscleLabel'),
    chooseTargetMuscleLabel: this.i18n.t('chooseTargetMuscleLabel'),
    chooseTargetMuscleMessage: this.i18n.t('chooseTargetMuscleMessage'),
    chooseExercisesMessage: this.i18n.t('chooseExercisesMessage'),
    workoutPlanningLabel: this.i18n.t('workoutPlanningLabel'),
    workingDayLabel: this.i18n.t('workingDayLabel'),
    weeklyPlanLabel: this.i18n.t('weeklyPlanLabel'),
    weeklyPlanHelpLabel: this.i18n.t('weeklyPlanHelpLabel'),
    isPersian: this.i18n.language() === 'fa',
  }));
  readonly workoutDetailText = computed<WorkoutDetailTextConfig>(() => ({
    workoutDetailsLabel: this.i18n.t('workoutDetails'),
    closeWorkoutDetailsLabel: this.i18n.t('closeWorkoutDetails'),
    repeatLabel: this.i18n.t('repeat'),
    weightLabel: this.i18n.t('weight'),
    addSetLabel: this.i18n.t('addSet'),
    markAsDoneLabel: this.i18n.t('markAsDone'),
    rejectWorkoutLabel: this.i18n.t('rejectWorkout'),
    isPersian: this.i18n.language() === 'fa',
  }));
  readonly exerciseDetailsText = computed<ExerciseDetailsTextConfig>(() => ({
    exerciseDetailsLabel: this.i18n.t('exerciseDetails'),
    closeExerciseDetailsLabel: this.i18n.t('closeExerciseDetails'),
    noDescriptionAvailableLabel: this.i18n.t('noDescriptionAvailable'),
    similarExercisesLabel: this.i18n.t('similarExercises'),
  }));

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
    this.editingWorkoutId.set(null);
    this.workoutTitle.set('');
    this.selectedWorkoutExercises.set([]);
    this.selectedTargetMuscle.set(null);
    this.workoutEditorStep.set('muscle');
    this.isWeeklyPlan.set(false);
    this.isExerciseSheetOpen.set(true);
    this.loadTargetMuscles();
  }

  openEditWorkoutSheet(workoutId: string) {
    const workout = this.workouts().find((candidate) => candidate.id === Number(workoutId));

    if (!workout) {
      this.selectedDayError.set(this.i18n.t('couldNotFindWorkoutToEdit'));
      return;
    }

    this.editingWorkoutId.set(workout.id);
    this.workoutTitle.set(workout.name);
    this.selectedWorkoutExercises.set([...workout.exercises]);
    this.selectedTargetMuscle.set(
      workout.targetMuscle ??
        workout.exercises.find((exercise) => exercise.targetMuscle)?.targetMuscle ??
        null,
    );
    this.workoutEditorStep.set(this.selectedTargetMuscle() ? 'exercises' : 'muscle');
    this.isWeeklyPlan.set(Boolean(workout.isWeeklyPlan));
    this.isExerciseSheetOpen.set(true);
    this.loadTargetMuscles();
    this.searchExercises('');
  }

  closeExerciseSheet() {
    this.isExerciseSheetOpen.set(false);
    this.editingWorkoutId.set(null);
    this.workoutTitle.set('');
    this.selectedWorkoutExercises.set([]);
    this.selectedTargetMuscle.set(null);
    this.workoutEditorStep.set('muscle');
    this.isWeeklyPlan.set(false);
  }

  selectTargetMuscle(targetMuscle: string) {
    this.selectedTargetMuscle.set(targetMuscle);
    this.selectedWorkoutExercises.set([]);
    this.searchExercises('');
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

  openWorkoutDetails(workoutId: string) {
    const workout = this.workouts().find((candidate) => candidate.id === Number(workoutId));

    if (!workout) {
      this.selectedDayError.set(this.i18n.t('couldNotFindWorkout'));
      return;
    }

    this.openedWorkoutId.set(workout.id);
  }

  closeWorkoutDetails() {
    this.openedWorkoutId.set(null);
  }

  setWorkoutCompletionStatus(
    workoutId: number,
    completionStatus: Extract<WorkoutCompletionStatus, 'completed' | 'rejected'>,
  ) {
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
  }

  completeWorkoutFromDetails(
    workoutId: number,
    completionStatus: Extract<WorkoutCompletionStatus, 'completed' | 'rejected'>,
  ) {
    this.setWorkoutCompletionStatus(workoutId, completionStatus);
    this.closeWorkoutDetails();
  }

  saveWorkoutFromSelectedExercises() {
    const selectedExercises = this.selectedWorkoutExercises();

    if (!selectedExercises.length) {
      this.exerciseSearchError.set(this.i18n.t('selectAtLeastOneExercise'));
      return;
    }

    if (this.editingWorkoutId() !== null) {
      this.updateWorkoutFromSelectedExercises(selectedExercises);
      return;
    }

    this.workouts.update((workouts) => {
      const nextWorkoutId = Math.max(...workouts.map((workout) => workout.id), 0) + 1;
      const firstExercise = selectedExercises[0];
      const workoutName = this.getWorkoutName();

      return [
        ...workouts,
        {
          id: nextWorkoutId,
          name: workoutName,
          exerciseId: firstExercise.id,
          thumbnailUrl: firstExercise.thumbnailUrl,
          exercises: selectedExercises,
          date: parseDateKey(this.selectedDate()),
          targetMuscle: this.selectedTargetMuscle() ?? firstExercise.targetMuscle,
          isWeeklyPlan: this.isWeeklyPlan(),
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

  private updateWorkoutFromSelectedExercises(selectedExercises: WorkoutExerciseSummary[]) {
    const editingWorkoutId = this.editingWorkoutId();

    if (editingWorkoutId === null) {
      return;
    }

    const firstExercise = selectedExercises[0];
    const workoutName = this.getWorkoutName();

    this.workouts.update((workouts) =>
      workouts.map((workout) =>
        workout.id === editingWorkoutId
          ? {
              ...workout,
              name: workoutName,
              exerciseId: firstExercise.id,
              thumbnailUrl: firstExercise.thumbnailUrl,
              exercises: selectedExercises,
              targetMuscle: this.selectedTargetMuscle() ?? firstExercise.targetMuscle,
              isWeeklyPlan: this.isWeeklyPlan(),
            }
          : workout,
      ),
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

    if (this.openedWorkoutId() === workoutId) {
      this.closeWorkoutDetails();
    }
  }

  markSelectedDayAsRestDay() {
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
    switch (status) {
      case 'in-progress':
        return this.i18n.t('inProgress');
      case 'done':
        return this.i18n.t('done');
      case 'rejected':
        return this.i18n.t('rejected');
      case 'upcoming':
        return this.i18n.t('incoming');
    }
  }

  getExerciseCountLabel(exerciseCount: number): string {
    return this.i18n.language() === 'fa'
      ? `${exerciseCount} حرکت`
      : `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  }

  getWorkoutExerciseName(exercise: WorkoutExerciseSummary): string {
    return this.i18n.language() === 'fa' ? exercise.nameFa : exercise.nameEn;
  }

  getWorkoutSheetTitle(): string {
    return this.editingWorkoutId() === null ? this.i18n.t('addWorkout') : this.i18n.t('editWorkout');
  }

  getWorkoutSaveButtonLabel(): string {
    return this.editingWorkoutId() === null ? this.i18n.t('addWorkout') : this.i18n.t('saveWorkout');
  }

  getDefaultWorkoutTitle(): string {
    const selectedDate = parseDateKey(this.selectedDate());
    const saturdayFirstDayIndexes = [6, 0, 1, 2, 3, 4, 5];
    const dayIndex = saturdayFirstDayIndexes.indexOf(selectedDate.getDay());
    const dayLabels = [
      this.i18n.t('firstDay'),
      this.i18n.t('secondDay'),
      this.i18n.t('thirdDay'),
      this.i18n.t('fourthDay'),
      this.i18n.t('fifthDay'),
      this.i18n.t('sixthDay'),
      this.i18n.t('seventhDay'),
    ];

    return dayLabels[dayIndex] ?? this.i18n.t('workoutDay');
  }

  addSet(workoutId: number, exerciseId: string) {
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
  }

  updateSet(
    workoutId: number,
    exerciseId: string,
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
  }

  private loadExercisesPage(offset: number) {
    this.isExerciseSearchLoading.set(true);
    this.exerciseSearchError.set(null);

    this.exerciseDbApi
      .search(this.exerciseSearchQuery(), offset, this.pageSize, this.selectedTargetMuscle())
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
          this.exerciseSearchError.set(this.i18n.t('couldNotLoadExercises'));
          this.isExerciseSearchLoading.set(false);
        },
      });
  }

  private loadTargetMuscles() {
    if (this.targetMuscles().length) {
      return;
    }

    this.exerciseDbApi
      .getTargetMuscles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (targetMuscles) => this.targetMuscles.set(targetMuscles),
        error: () => this.exerciseSearchError.set(this.i18n.t('couldNotLoadExercises')),
      });
  }

  private getDailyPlan(date: string): DailyWorkoutPlan {
    const workouts = this.getWorkoutsForDate(date).map((workout) => ({
      id: String(workout.id),
      title: workout.name,
      scheduledDate: getDateKey(workout.date),
      exerciseCount: workout.exercises.length,
      estimatedMinutes: Math.max(workout.exercises.length * 12, 15),
      exercises: workout.exercises.map((exercise) => {
        const firstSet = exercise.sets[0];

        return {
          id: exercise.id,
          name: this.getWorkoutExerciseName(exercise),
          setCount: exercise.sets.length,
          weight: firstSet?.weight ?? 0,
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
          name: this.i18n.language() === 'fa'
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

  private toWorkoutExerciseSummary(exercise: ExerciseDbExercise): WorkoutExerciseSummary {
    return {
      id: exercise.id,
      name: exercise.name,
      nameEn: exercise.nameEn,
      nameFa: exercise.nameFa,
      targetMuscle: exercise.targetMuscle,
      thumbnailUrl: this.getExerciseMediaUrl(exercise) ?? undefined,
      sets: [{ id: 1, repeat: 0, weight: 0 }],
    };
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

  private getWorkoutName(): string {
    const customTitle = this.workoutTitle().trim();

    if (customTitle) {
      return customTitle;
    }

    return this.getDefaultWorkoutTitle();
  }

  private getDateLocale(): string | undefined {
    return this.i18n.language() === 'fa' ? 'fa-IR' : undefined;
  }
}
