import { isPlatformBrowser, Location } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AppButton } from '../../../../components/app-button/app-button';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { WorkoutCompletionStatus } from '../../models/workout-planner.models';
import {
  CopiedWorkoutClipboard,
  Workout,
  WorkoutExerciseSection,
  WorkoutExerciseSummary,
  WorkoutSet,
} from '../../models/workout-storage.models';
import { WorkoutEditorTextConfig } from '../../models/workout-ui.models';
import {
  ExerciseDbApiService,
  ExerciseDbExercise,
  TargetMuscleOption,
} from '../../services/exercise-db-api.service';
import {
  getDateKey,
  getTodayDateKey,
  isDateKey,
  parseDateKey,
} from '../../utils/calendar-date.util';
import {
  clearCopiedWorkout,
  loadCopiedWorkout,
  readCopiedWorkoutFromSystemClipboard,
} from '../../utils/workout-clipboard.util';

export type WorkoutEditorStep = 'exercises' | 'planning';

@Component({
  selector: 'app-add-workout',
  standalone: true,
  imports: [AppButton],
  templateUrl: './add-workout.component.html',
  styles: `
    .selected {
      @apply border border-[#0070F0];
    }
  `,
})
export class AddWorkoutComponent {
  private readonly storageKey = 'gym-activity-tracker.workouts';
  private readonly restDaysStorageKey = 'gym-activity-tracker.rest-days';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly exerciseDbApi = inject(ExerciseDbApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly i18n = inject(I18nService);
  private readonly pageSize = 15;
  private exerciseSearchRequestId = 0;

  readonly workouts = signal<Workout[]>(this.loadWorkouts());
  readonly restDayKeys = signal<string[]>(this.loadRestDayKeys());
  readonly selectedDate = signal(this.getInitialSelectedDate());
  readonly workoutTitle = signal('');
  readonly selectedExercises = signal<WorkoutExerciseSummary[]>([]);
  readonly selectedExerciseSection = signal<WorkoutExerciseSection | undefined>('warmup');
  readonly exerciseSections: readonly WorkoutExerciseSection[] = ['warmup', 'main', 'cooldown'];
  readonly exerciseSearchQuery = signal('');
  readonly exerciseSearchResults = signal<ExerciseDbExercise[]>([]);
  readonly exerciseSearchTotal = signal(0);
  readonly isExerciseSearchLoading = signal(false);
  readonly exerciseSearchError = signal<string | undefined>(undefined);
  readonly targetMuscles = signal<TargetMuscleOption[]>([]);
  readonly selectedTargetMuscle = signal<string | undefined>('chest');
  readonly step = signal<WorkoutEditorStep>('exercises');
  readonly isWeeklyPlan = signal(false);
  readonly editingWorkoutId = signal<number | undefined>(this.getInitialEditingWorkoutId());
  readonly copiedWorkoutState = signal(loadCopiedWorkout());
  readonly copiedWorkoutPasteError = signal<string | undefined>(undefined);
  readonly copiedWorkout = computed(() => {
    const state = this.copiedWorkoutState();

    return state.status === 'ok' ? state.clipboard : null;
  });

  readonly imageBaseUrl = this.exerciseDbApi.imageBaseUrl;
  readonly selectedDateLabel = computed(() =>
    parseDateKey(this.selectedDate()).toLocaleDateString(this.getDateLocale(), {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  );
  readonly title = computed(() =>
    this.editingWorkoutId() === undefined ? this.i18n.t('addWorkout') : this.i18n.t('editWorkout'),
  );
  readonly saveButtonLabel = computed(() =>
    this.editingWorkoutId() === undefined ? this.i18n.t('addWorkout') : this.i18n.t('saveWorkout'),
  );
  readonly defaultWorkoutTitle = computed(() => {
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
  });
  readonly text = computed<WorkoutEditorTextConfig>(() => ({
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
    closeLabel: this.i18n.t('close'),
    pasteLabel: this.i18n.t('paste'),
    pasteCopiedWorkoutLabel: this.i18n.t('pasteCopiedWorkout'),
    pasteFromClipboardLabel: this.i18n.t('pasteFromClipboard'),
    invalidCopiedWorkoutLabel: this.i18n.t('invalidCopiedWorkout'),
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

  constructor() {
    this.loadTargetMuscles();
    this.initializeEditState();
  }

  goBack() {
    if (this.step() === 'planning') {
      this.step.set('exercises');
      return;
    }

    this.location.back();
  }

  goNext() {
    if (this.step() === 'exercises') {
      if (this.selectedExercises().length) {
        this.step.set('planning');
      }
      return;
    }

    this.save();
  }

  canContinueFromCurrentStep(): boolean {
    return this.step() === 'planning' || Boolean(this.selectedExercises().length);
  }

  selectDate(dateKey: string) {
    if (isDateKey(dateKey)) {
      this.selectedDate.set(dateKey);
    }
  }

  selectTargetMuscle(targetMuscle: string) {
    if (this.selectedTargetMuscle() === targetMuscle) {
      this.selectedTargetMuscle.set('');
    } else {
      this.selectedTargetMuscle.set(targetMuscle);
    }
    this.searchExercises('');
  }

  searchExercises(query: string) {
    if (!this.selectedExerciseSection()) {
      return;
    }

    this.exerciseSearchQuery.set(query);
    this.exerciseSearchResults.set([]);
    this.exerciseSearchTotal.set(0);
    this.exerciseSearchRequestId += 1;
    this.loadExercisesPage(0, this.exerciseSearchRequestId);
  }

  loadMoreExercises() {
    if (
      this.isExerciseSearchLoading() ||
      this.exerciseSearchResults().length >= this.exerciseSearchTotal()
    ) {
      return;
    }

    this.loadExercisesPage(this.exerciseSearchResults().length, this.exerciseSearchRequestId);
  }

  onExerciseListScroll(event: Event) {
    const target = event.target as HTMLElement;
    const remainingScroll = target.scrollHeight - target.scrollTop - target.clientHeight;

    if (remainingScroll < 240) {
      this.loadMoreExercises();
    }
  }

  toggleExercise(exercise: ExerciseDbExercise) {
    const exerciseSummary = this.toWorkoutExerciseSummary(exercise);

    this.selectedExercises.update((selectedExercises) => {
      const selectedExercise = selectedExercises.find((candidate) => candidate.id === exercise.id);

      if (!selectedExercise) {
        return [...selectedExercises, exerciseSummary];
      }

      return selectedExercises.filter((candidate) => candidate.id !== exercise.id);
    });
  }

  selectExerciseSection(section: WorkoutExerciseSection) {
    this.selectedExerciseSection.set(section);
    this.selectedTargetMuscle.set(section === 'main' ? 'chest' : undefined);
    this.searchExercises('');
  }

  getExerciseSectionLabel(section: WorkoutExerciseSection): string {
    return this.i18n.t(
      section === 'warmup' ? 'warmup' : section === 'main' ? 'mainWorkout' : 'cooldown',
    );
  }

  getExerciseSectionCount(section: WorkoutExerciseSection): number {
    return this.selectedExercises().filter(
      (exercise) => this.getExerciseSection(exercise) === section,
    ).length;
  }

  removeSelectedExercise(exerciseId: string) {
    this.selectedExercises.update((selectedExercises) =>
      selectedExercises.filter((exercise) => exercise.id !== exerciseId),
    );
  }

  pasteCopiedWorkout() {
    const state = this.copiedWorkoutState();

    if (state.status !== 'ok') {
      return;
    }

    this.applyCopiedWorkout(state.clipboard);
    this.dismissCopiedWorkout();
  }

  async pasteFromClipboard() {
    this.copiedWorkoutPasteError.set(undefined);

    const result = await readCopiedWorkoutFromSystemClipboard();

    if (result.status === 'invalid') {
      this.copiedWorkoutPasteError.set(this.i18n.t('invalidCopiedWorkout'));
      return;
    }

    if (result.status === 'ok') {
      this.applyCopiedWorkout(result.clipboard);
    }
  }

  private applyCopiedWorkout(copiedWorkout: CopiedWorkoutClipboard) {
    const pastedExercises = copiedWorkout.exercises.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set })),
      section: this.getExerciseSection(exercise),
    }));

    this.selectedExercises.update((selectedExercises) => {
      const mergedExercises = [...selectedExercises];

      for (const exercise of pastedExercises) {
        if (!mergedExercises.some((selectedExercise) => selectedExercise.id === exercise.id)) {
          mergedExercises.push(exercise);
        }
      }

      return mergedExercises;
    });

    if (!this.workoutTitle().trim()) {
      this.workoutTitle.set(copiedWorkout.name);
    }
  }

  dismissCopiedWorkout() {
    this.copiedWorkoutState.set({ status: 'empty' });
    this.copiedWorkoutPasteError.set(undefined);
    clearCopiedWorkout();
  }

  updateSelectedExerciseSetCount(exerciseId: string, setCount: number) {
    const normalizedSetCount = Math.max(Math.floor(setCount), 1);

    this.selectedExercises.update((selectedExercises) =>
      selectedExercises.map((exercise) =>
        exercise.id === exerciseId
          ? { ...exercise, sets: this.resizeWorkoutSets(exercise.sets, normalizedSetCount) }
          : exercise,
      ),
    );
  }

  save() {
    const selectedExercises = this.selectedExercises();

    if (!selectedExercises.length) {
      this.exerciseSearchError.set(this.i18n.t('selectAtLeastOneExercise'));
      return;
    }

    if (this.editingWorkoutId() === undefined) {
      this.createWorkout(selectedExercises);
    } else {
      this.updateWorkout(selectedExercises);
    }

    this.restDayKeys.update((dateKeys) =>
      dateKeys.filter((dateKey) => dateKey !== this.selectedDate()),
    );
    this.saveWorkouts();
    this.saveRestDayKeys();
    void this.router.navigateByUrl('/');
  }

  getExerciseCountLabel(exerciseCount: number): string {
    return this.text().isPersian
      ? `${exerciseCount} حرکت`
      : `${exerciseCount} ${exerciseCount === 1 ? 'exercise' : 'exercises'}`;
  }

  getWorkoutExerciseName(exercise: WorkoutExerciseSummary): string {
    return this.text().isPersian ? exercise.nameFa : exercise.nameEn;
  }

  getSelectedExerciseSetCount(exercise: WorkoutExerciseSummary): number {
    return Math.max(exercise.sets.length, 1);
  }

  getSelectedExerciseSetCountById(exerciseId: string): number {
    const selectedExercise = this.selectedExercises().find(
      (exercise) => exercise.id === exerciseId,
    );

    return selectedExercise ? this.getSelectedExerciseSetCount(selectedExercise) : 1;
  }

  getTargetMuscleLabel(targetMuscle: string | undefined): string {
    if (!targetMuscle) {
      return '';
    }

    return this.targetMuscles().find((muscle) => muscle.id === targetMuscle)?.label ?? targetMuscle;
  }

  isExerciseSelected(exerciseId: string): boolean {
    return this.selectedExercises().some((exercise) => exercise.id === exerciseId);
  }

  getExerciseMediaUrl(exercise: ExerciseDbExercise): string | undefined {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return mediaPath ? this.imageBaseUrl + mediaPath : undefined;
  }

  private createWorkout(selectedExercises: WorkoutExerciseSummary[]) {
    this.workouts.update((workouts) => {
      const nextWorkoutId = Math.max(...workouts.map((workout) => workout.id), 0) + 1;
      const firstExercise = selectedExercises[0];

      return [
        ...workouts,
        {
          id: nextWorkoutId,
          name: this.getWorkoutName(),
          exerciseId: firstExercise.id,
          thumbnailUrl: firstExercise.thumbnailUrl,
          exercises: selectedExercises,
          date: parseDateKey(this.selectedDate()),
          targetMuscle: this.getWorkoutTargetMuscle(selectedExercises),
          isWeeklyPlan: this.isWeeklyPlan(),
          completionStatus: 'pending',
          sets: [{ id: 1, repeat: 0, weight: 0 }],
        },
      ];
    });
  }

  private updateWorkout(selectedExercises: WorkoutExerciseSummary[]) {
    const editingWorkoutId = this.editingWorkoutId();

    if (editingWorkoutId === undefined) {
      return;
    }

    const firstExercise = selectedExercises[0];

    this.workouts.update((workouts) =>
      workouts.map((workout) =>
        workout.id === editingWorkoutId
          ? {
              ...workout,
              name: this.getWorkoutName(),
              exerciseId: firstExercise.id,
              thumbnailUrl: firstExercise.thumbnailUrl,
              exercises: selectedExercises,
              date: parseDateKey(this.selectedDate()),
              targetMuscle: this.getWorkoutTargetMuscle(selectedExercises),
              isWeeklyPlan: this.isWeeklyPlan(),
            }
          : workout,
      ),
    );
  }

  private loadExercisesPage(offset: number, requestId: number) {
    this.isExerciseSearchLoading.set(true);
    this.exerciseSearchError.set(undefined);

    this.exerciseDbApi
      .search(
        this.exerciseSearchQuery(),
        offset,
        this.pageSize,
        this.selectedTargetMuscle(),
        this.selectedExerciseSection(),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items, total }) => {
          if (requestId !== this.exerciseSearchRequestId) {
            return;
          }

          this.exerciseSearchResults.update((results) =>
            offset === 0 ? items : [...results, ...items],
          );
          this.exerciseSearchTotal.set(total);
          this.isExerciseSearchLoading.set(false);
        },
        error: () => {
          if (requestId !== this.exerciseSearchRequestId) {
            return;
          }

          this.exerciseSearchError.set(this.i18n.t('couldNotLoadExercises'));
          this.isExerciseSearchLoading.set(false);
        },
      });
  }

  private loadTargetMuscles() {
    this.exerciseDbApi
      .getTargetMuscles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (targetMuscles) => this.targetMuscles.set(targetMuscles),
        error: () => this.exerciseSearchError.set(this.i18n.t('couldNotLoadExercises')),
      });
  }

  private initializeEditState() {
    const editingWorkoutId = this.editingWorkoutId();

    if (editingWorkoutId === undefined) {
      return;
    }

    const workout = this.workouts().find((candidate) => candidate.id === editingWorkoutId);

    if (!workout) {
      this.location.back();
      return;
    }

    this.workoutTitle.set(workout.name);
    this.selectedDate.set(getDateKey(workout.date));
    this.selectedExercises.set([...workout.exercises]);
    this.selectedTargetMuscle.set(
      workout.targetMuscle ??
        workout.exercises.find((exercise) => exercise.targetMuscle)?.targetMuscle ??
        undefined,
    );
    this.step.set('exercises');
    this.isWeeklyPlan.set(Boolean(workout.isWeeklyPlan));
  }

  private getInitialSelectedDate(): string {
    const date = this.route.snapshot.queryParamMap.get('date');

    return date && isDateKey(date) ? date : getTodayDateKey();
  }

  private getInitialEditingWorkoutId(): number | undefined {
    const editId = Number(this.route.snapshot.queryParamMap.get('editId'));

    return Number.isInteger(editId) && editId > 0 ? editId : undefined;
  }

  private loadWorkouts(): Workout[] {
    if (!this.isBrowser) {
      return [];
    }

    try {
      const storedWorkouts = localStorage.getItem(this.storageKey);
      const workouts = storedWorkouts ? (JSON.parse(storedWorkouts) as Workout[]) : [];

      return Array.isArray(workouts)
        ? workouts.map((workout) => ({
            ...workout,
            date: new Date(workout.date),
            exercises: this.normalizeWorkoutExercises(workout),
            sets: Array.isArray(workout.sets) ? workout.sets : [],
            completionStatus: this.normalizeCompletionStatus(workout.completionStatus),
          }))
        : [];
    } catch {
      return [];
    }
  }

  private saveWorkouts() {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.workouts()));
    }
  }

  private loadRestDayKeys(): string[] {
    if (!this.isBrowser) {
      return [];
    }

    try {
      const storedRestDays = localStorage.getItem(this.restDaysStorageKey);
      const restDays = storedRestDays ? (JSON.parse(storedRestDays) as unknown) : [];

      return Array.isArray(restDays)
        ? restDays.filter((dateKey): dateKey is string => typeof dateKey === 'string')
        : [];
    } catch {
      return [];
    }
  }

  private saveRestDayKeys() {
    if (this.isBrowser) {
      localStorage.setItem(this.restDaysStorageKey, JSON.stringify(this.restDayKeys()));
    }
  }

  private normalizeCompletionStatus(
    completionStatus: WorkoutCompletionStatus | undefined,
  ): WorkoutCompletionStatus {
    return completionStatus === 'pending' ||
      completionStatus === 'completed' ||
      completionStatus === 'rejected'
      ? completionStatus
      : 'pending';
  }

  private normalizeWorkoutExercises(workout: Workout): WorkoutExerciseSummary[] {
    if (Array.isArray(workout.exercises)) {
      return workout.exercises.map((exercise) => ({
        ...exercise,
        nameEn: exercise.nameEn ?? exercise.name,
        nameFa: exercise.nameFa ?? exercise.name,
        targetMuscle: exercise.targetMuscle ?? workout.targetMuscle,
        name:
          this.i18n.language() === 'fa'
            ? (exercise.nameFa ?? exercise.name)
            : (exercise.nameEn ?? exercise.name),
        sets: this.normalizeWorkoutSets(exercise.sets),
        section: this.getExerciseSection(exercise),
      }));
    }

    return workout.exerciseId
      ? [
          {
            id: workout.exerciseId,
            name: workout.name,
            nameEn: workout.name,
            nameFa: workout.name,
            targetMuscle: workout.targetMuscle,
            thumbnailUrl: workout.thumbnailUrl,
            sets: this.normalizeWorkoutSets(workout.sets),
            section: 'main',
          },
        ]
      : [];
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
      section: exercise.section,
    };
  }

  private getExerciseSection(exercise: WorkoutExerciseSummary): WorkoutExerciseSection {
    return exercise.section === 'warmup' || exercise.section === 'cooldown'
      ? exercise.section
      : 'main';
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

  private resizeWorkoutSets(sets: WorkoutSet[] | undefined, setCount: number): WorkoutSet[] {
    const normalizedSets = this.normalizeWorkoutSets(sets);

    if (normalizedSets.length >= setCount) {
      return normalizedSets.slice(0, setCount);
    }

    const nextSets = [...normalizedSets];

    while (nextSets.length < setCount) {
      const nextSetId = Math.max(...nextSets.map((set) => set.id), 0) + 1;
      nextSets.push({ id: nextSetId, repeat: 0, weight: 0 });
    }

    return nextSets;
  }

  private getWorkoutName(): string {
    return this.workoutTitle().trim() || this.defaultWorkoutTitle();
  }

  private getWorkoutTargetMuscle(selectedExercises: WorkoutExerciseSummary[]): string {
    return [
      ...new Set(
        selectedExercises
          .map((exercise) => exercise.targetMuscle)
          .filter((targetMuscle): targetMuscle is string => Boolean(targetMuscle)),
      ),
    ].join(', ');
  }

  private getDateLocale(): string | undefined {
    return this.i18n.language() === 'fa' ? 'fa-IR' : undefined;
  }
}
