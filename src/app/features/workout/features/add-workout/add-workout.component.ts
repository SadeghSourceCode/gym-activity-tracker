import { isPlatformBrowser, Location } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AppButton } from '../../../../components/app-button/app-button';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { AddWorkoutHeaderComponent } from '../../components/add-workout-header/add-workout-header.component';
import {
  AddWorkoutHeaderConfig,
  AddWorkoutStep,
} from '../../data-access/models/add-workout-header-config.interface';
import { WorkoutPlanningStepComponent } from '../../components/workout-planning-step/workout-planning-step.component';
import { AddWorkoutService } from '../../data-access/services/add-workout.service';
import { WorkoutPlanningChangedOutput } from '../../data-access/models/workout-planning-changed-output.interface';
import { AddWorkoutSaveConfig } from '../../data-access/models/add-workout-save-config.interface';
import { WorkoutPlanningStepConfig } from '../../data-access/models/workout-planning-step-config.interface';
import {
  CopiedWorkoutClipboard,
  Workout,
  WorkoutExerciseSection,
  WorkoutExerciseSummary,
} from '../../data-access/models/workout-storage.models';
import { WorkoutEditorTextConfig } from '../../data-access/models/workout-ui.models';
import {
  ExerciseDbExercise,
  TargetMuscleOption,
} from '../../data-access/services/exercise-db-api.service';
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

@Component({
  selector: 'app-add-workout',
  standalone: true,
  imports: [AppButton, AddWorkoutHeaderComponent, WorkoutPlanningStepComponent],
  templateUrl: './add-workout.component.html',
  styles: `
    .selected {
      @apply border border-[#0070F0];
    }
  `,
})
export class AddWorkoutComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly addWorkoutService = inject(AddWorkoutService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly i18n = inject(I18nService);
  private readonly pageSize = 15;
  private exerciseSearchRequestId = 0;

  readonly workouts = signal<Workout[]>(
    this.addWorkoutService.loadWorkouts(this.isBrowser, this.i18n.language() === 'fa'),
  );
  readonly restDayKeys = signal<string[]>(this.addWorkoutService.loadRestDayKeys(this.isBrowser));
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
  readonly step = signal<AddWorkoutStep>('exercises');
  readonly isWeeklyPlan = signal(false);
  readonly editingWorkoutId = signal<number | undefined>(this.getInitialEditingWorkoutId());
  readonly copiedWorkoutState = signal(loadCopiedWorkout());
  readonly copiedWorkoutPasteError = signal<string | undefined>(undefined);
  readonly copiedWorkout = computed(() => {
    const state = this.copiedWorkoutState();

    return state.status === 'ok' ? state.clipboard : null;
  });

  readonly imageBaseUrl = this.addWorkoutService.imageBaseUrl;
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
  readonly headerConfig = computed<AddWorkoutHeaderConfig>(() => ({
    title: this.title(),
    selectedDateLabel: this.selectedDateLabel(),
    step: this.step(),
    backLabel: this.text().backLabel,
    nextLabel: this.step() === 'planning' ? this.saveButtonLabel() : this.text().continueLabel,
    nextDisabled: !this.canContinueFromCurrentStep(),
  }));
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
  readonly planningConfig = computed<WorkoutPlanningStepConfig>(() => ({
    workoutTitle: this.workoutTitle(),
    defaultWorkoutTitle: this.defaultWorkoutTitle(),
    selectedDate: this.selectedDate(),
    isWeeklyPlan: this.isWeeklyPlan(),
    exercises: this.selectedExercises().map((exercise) => ({
      id: exercise.id,
      name: this.getWorkoutExerciseName(exercise),
      setCount: this.getSelectedExerciseSetCount(exercise),
    })),
    workoutTitleLabel: this.text().workoutTitleLabel,
    leaveEmptyToUseLabel: this.text().leaveEmptyToUseLabel,
    workingDayLabel: this.text().workingDayLabel,
    weeklyPlanLabel: this.text().weeklyPlanLabel,
    weeklyPlanHelpLabel: this.text().weeklyPlanHelpLabel,
    selectedExercisesLabel: this.text().selectedExercisesLabel,
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

  handlePlanningChanged(change: WorkoutPlanningChangedOutput) {
    if (change.workoutTitle !== undefined) {
      this.workoutTitle.set(change.workoutTitle);
    }
    if (change.selectedDate !== undefined) {
      this.selectDate(change.selectedDate);
    }
    if (change.isWeeklyPlan !== undefined) {
      this.isWeeklyPlan.set(change.isWeeklyPlan);
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
    this.selectedExercises.update((selectedExercises) =>
      this.addWorkoutService.toggleExercise(selectedExercises, exercise, this.imageBaseUrl),
    );
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
      (exercise) => this.addWorkoutService.getExerciseSection(exercise) === section,
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
    this.selectedExercises.update((selectedExercises) =>
      this.addWorkoutService.mergeCopiedWorkout(selectedExercises, copiedWorkout),
    );

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
    this.selectedExercises.update((selectedExercises) =>
      this.addWorkoutService.updateExerciseSetCount(selectedExercises, exerciseId, setCount),
    );
  }

  private getSaveConfig(selectedExercises: WorkoutExerciseSummary[]): AddWorkoutSaveConfig {
    return {
      workoutTitle: this.workoutTitle(),
      defaultWorkoutTitle: this.defaultWorkoutTitle(),
      selectedDate: this.selectedDate(),
      selectedExercises,
      targetMuscle: this.addWorkoutService.getWorkoutTargetMuscle(selectedExercises),
      isWeeklyPlan: this.isWeeklyPlan(),
    };
  }

  private persistWorkoutChanges() {
    this.addWorkoutService.saveWorkouts(this.isBrowser, this.workouts());
    this.addWorkoutService.saveRestDayKeys(this.isBrowser, this.restDayKeys());
  }

  private createWorkout(selectedExercises: WorkoutExerciseSummary[]) {
    this.workouts.update((workouts) =>
      this.addWorkoutService.createWorkout(workouts, this.getSaveConfig(selectedExercises)),
    );
  }

  private updateWorkout(selectedExercises: WorkoutExerciseSummary[]) {
    const editingWorkoutId = this.editingWorkoutId();

    if (editingWorkoutId === undefined) {
      return;
    }

    this.workouts.update((workouts) =>
      this.addWorkoutService.updateWorkout(
        workouts,
        editingWorkoutId,
        this.getSaveConfig(selectedExercises),
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
    this.persistWorkoutChanges();
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

  private loadExercisesPage(offset: number, requestId: number) {
    this.isExerciseSearchLoading.set(true);
    this.exerciseSearchError.set(undefined);

    this.addWorkoutService
      .searchExercises(
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
    this.addWorkoutService
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

  private getDateLocale(): string | undefined {
    return this.i18n.language() === 'fa' ? 'fa-IR' : undefined;
  }
}
