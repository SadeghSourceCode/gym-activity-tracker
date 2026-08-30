import { isPlatformBrowser, Location } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AppButton } from '../../../../components/app-button/app-button';
import { AppHeader } from '../../../../components/app-header/app-header';
import { AppHeaderConfig } from '../../../../data-access/models/app-header-config.interface';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { ExerciseSelectionStepComponent } from '../../components/exercise-selection-step/exercise-selection-step.component';
import { WorkoutPlanningStepComponent } from '../../components/workout-planning-step/workout-planning-step.component';
import { ExerciseSelectionStepConfig } from '../../data-access/models/exercise-selection-step-config.interface';
import { WorkoutPlanningChangedOutput } from '../../data-access/models/workout-planning-changed-output.interface';
import { WorkoutPlanningStepConfig } from '../../data-access/models/workout-planning-step-config.interface';
import {
  Workout,
  WorkoutExerciseSummary,
  WorkoutRecurrence,
} from '../../data-access/models/workout-storage.models';
import { WorkoutEditorTextConfig } from '../../data-access/models/workout-ui.models';
import { AddWorkoutService } from '../../data-access/services/add-workout.service';
import {
  Exercise,
  TargetMuscleOption,
} from '../../../exercise-library/data-access/models/exercise.models';
import { ExerciseLibraryService } from '../../../exercise-library/data-access/services/exercise-library.service';
import { getDateKey, getTodayDateKey, isDateKey } from '../../utils/calendar-date.util';
import { getSuggestedWorkoutName } from '../../utils/workout-plan-name.util';

type AddWorkoutStep = 'exercises' | 'planning';

@Component({
  selector: 'app-add-workout',
  host: { class: 'block h-full' },
  standalone: true,
  imports: [AppButton, AppHeader, ExerciseSelectionStepComponent, WorkoutPlanningStepComponent],
  templateUrl: './add-workout.component.html',
})
export class AddWorkoutComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly addWorkoutService = inject(AddWorkoutService);
  private readonly exerciseLibrary = inject(ExerciseLibraryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  readonly i18n = inject(I18nService);
  private readonly pageSize = 15;
  private exerciseSearchRequestId = 0;

  readonly workouts = signal<Workout[]>(
    this.addWorkoutService.loadWorkouts(this.isBrowser, this.i18n.language() === 'fa'),
  );
  readonly restDayKeys = signal(this.addWorkoutService.loadRestDayKeys(this.isBrowser));
  readonly selectedDate = signal(this.getInitialSelectedDate());
  readonly workoutTitle = signal('');
  readonly selectedExercises = signal<WorkoutExerciseSummary[]>([]);
  readonly exerciseSearchQuery = signal('');
  readonly exerciseSearchResults = signal<Exercise[]>([]);
  readonly exerciseSearchTotal = signal(0);
  readonly isExerciseSearchLoading = signal(false);
  readonly exerciseSearchError = signal<string | undefined>(undefined);
  readonly targetMuscles = signal<TargetMuscleOption[]>([]);
  readonly selectedTargetMuscle = signal<string | undefined>(undefined);
  readonly step = signal<AddWorkoutStep>('exercises');
  readonly recurrenceFrequency = signal<WorkoutRecurrence['frequency'] | undefined>(undefined);
  readonly editingWorkoutId = signal<number | undefined>(this.getInitialEditingWorkoutId());

  readonly title = computed(() =>
    this.editingWorkoutId() === undefined ? this.i18n.t('addWorkout') : this.i18n.t('editWorkout'),
  );
  readonly saveButtonLabel = computed(() =>
    this.editingWorkoutId() === undefined ? this.i18n.t('addWorkout') : this.i18n.t('saveWorkout'),
  );
  readonly headerConfig = computed<AppHeaderConfig>(() => ({
    title: this.title(),
    leftButton:
      this.step() === 'planning'
        ? {
            title: this.text().backLabel,
            type: 'button',
            variant: 'link',
            mode: 'section',
          }
        : undefined,
    rightButton:
      this.step() === 'exercises'
        ? {
            title: this.text().continueLabel,
            type: 'button',
            variant: 'link',
            mode: 'section',
            disabled: !this.selectedExercises().length,
          }
        : undefined,
  }));
  readonly defaultWorkoutTitle = computed(() =>
    getSuggestedWorkoutName(
      this.selectedExercises(),
      (muscle) => this.getTargetMuscleLabel(muscle),
      this.i18n.t('workoutDay'),
      this.i18n.language() === 'fa' ? 'تمرین' : 'Workout',
      this.i18n.language() === 'fa' ? 'تمرین تمام بدن' : 'Full Body Workout',
    ),
  );
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
  readonly selectionConfig = computed<ExerciseSelectionStepConfig>(() => ({
    selectedDate: this.selectedDate(),
    searchQuery: this.exerciseSearchQuery(),
    exercises: this.exerciseSearchResults().map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      targetMuscleLabel: this.getTargetMuscleLabel(exercise.targetMuscle),
      equipmentLabel:
        typeof exercise.equipment === 'string'
          ? exercise.equipment
          : exercise.equipment?.join(', '),
      mediaUrl: this.exerciseLibrary.getMediaUrl(exercise) ?? undefined,
      selected: this.isExerciseSelected(exercise.id),
    })),
    muscles: this.targetMuscles().map((muscle) => ({
      id: muscle.id,
      label: muscle.label,
      imageUrl: muscle.imageUrl,
      description: muscle.mainMuscles,
      selected: this.selectedTargetMuscle() === muscle.id,
    })),
    selectedCount: this.selectedExercises().length,
    loading: this.isExerciseSearchLoading(),
    hasMore: this.exerciseSearchResults().length < this.exerciseSearchTotal(),
    error: this.exerciseSearchError(),
    searchPlaceholder: this.text().searchByNameMuscleEquipmentLabel,
    selectedLabel: this.text().selectedLabel,
    loadingLabel: this.text().loadingExercisesLabel,
    emptyLabel: this.text().noExercisesFoundLabel,
  }));
  readonly planningConfig = computed<WorkoutPlanningStepConfig>(() => ({
    workoutTitle: this.workoutTitle(),
    defaultWorkoutTitle: this.defaultWorkoutTitle(),
    recurrenceFrequency: this.recurrenceFrequency(),
    exercises: this.selectedExercises().map((exercise) => ({
      id: exercise.id,
      name: this.getWorkoutExerciseName(exercise),
      setCount: Math.max(exercise.sets.length, 1),
    })),
    workoutTitleLabel: this.text().workoutTitleLabel,
    leaveEmptyToUseLabel: this.text().leaveEmptyToUseLabel,
    weeklyPlanLabel: this.i18n.language() === 'fa' ? 'هفتگی' : 'Weekly',
    monthlyPlanLabel: this.i18n.language() === 'fa' ? 'ماهانه' : 'Monthly',
    noRecurrenceLabel: this.i18n.language() === 'fa' ? 'بدون تکرار' : 'Does not repeat',
    weeklyPlanHelpLabel: this.i18n.language() === 'fa' ? 'تکرار تمرین' : 'Workout recurrence',
    selectedExercisesLabel: this.text().selectedExercisesLabel,
    setsLabel: this.i18n.language() === 'fa' ? 'ست' : 'sets',
    removeLabel: this.text().removeLabel,
    reorderLabel: this.i18n.language() === 'fa' ? 'برای جابه‌جایی بکشید' : 'Drag to reorder',
  }));

  constructor() {
    this.loadTargetMuscles();
    this.initializeEditState();
    this.searchExercises('');
  }

  goBack() {
    if (this.step() === 'planning') this.step.set('exercises');
    else this.location.back();
  }
  goNext() {
    if (this.addWorkoutService.canContinueToPlanning(this.selectedExercises()))
      this.step.set('planning');
  }
  selectDate(dateKey: string) {
    if (isDateKey(dateKey)) this.selectedDate.set(dateKey);
  }
  handlePlanningChanged(change: WorkoutPlanningChangedOutput) {
    if (change.workoutTitle !== undefined) this.workoutTitle.set(change.workoutTitle);
    if (change.recurrenceFrequency !== undefined)
      this.recurrenceFrequency.set(change.recurrenceFrequency ?? undefined);
  }
  selectTargetMuscle(targetMuscle: string) {
    this.selectedTargetMuscle.update((current) =>
      current === targetMuscle ? undefined : targetMuscle,
    );
    this.searchExercises('');
  }
  searchExercises(query: string) {
    this.exerciseSearchQuery.set(query);
    this.exerciseSearchResults.set([]);
    this.exerciseSearchTotal.set(0);
    this.loadExercisesPage(0, ++this.exerciseSearchRequestId);
  }
  loadMoreExercises() {
    if (
      this.isExerciseSearchLoading() ||
      this.exerciseSearchResults().length >= this.exerciseSearchTotal()
    )
      return;
    this.loadExercisesPage(this.exerciseSearchResults().length, this.exerciseSearchRequestId);
  }
  toggleExercise(exerciseId: string) {
    const exercise = this.exerciseSearchResults().find((candidate) => candidate.id === exerciseId);
    if (exercise)
      this.selectedExercises.update((selected) =>
        this.addWorkoutService.toggleExercise(selected, exercise, 'main'),
      );
  }
  removeSelectedExercise(exerciseId: string) {
    this.selectedExercises.update((selected) =>
      selected.filter((exercise) => exercise.id !== exerciseId),
    );
  }
  updateSelectedExerciseSetCount(change: { exerciseId: string; setCount: number }) {
    this.selectedExercises.update((selected) =>
      this.addWorkoutService.updateExerciseSetCount(selected, change.exerciseId, change.setCount),
    );
  }
  reorderSelectedExercise(change: { exerciseId: string; targetExerciseId: string }) {
    this.selectedExercises.update((selected) =>
      this.addWorkoutService.reorderExercise(selected, change.exerciseId, change.targetExerciseId),
    );
  }
  save() {
    if (!this.selectedExercises().length) return;
    const result = this.addWorkoutService.saveWorkoutFlow(
      this.isBrowser,
      this.workouts(),
      this.restDayKeys(),
      this.editingWorkoutId(),
      {
        workoutTitle: this.workoutTitle(),
        defaultWorkoutTitle: this.defaultWorkoutTitle(),
        selectedDate: this.selectedDate(),
        selectedExercises: this.selectedExercises(),
        targetMuscle: this.addWorkoutService.getWorkoutTargetMuscle(this.selectedExercises()),
        recurrenceFrequency: this.recurrenceFrequency(),
      },
    );
    this.workouts.set(result.workouts);
    this.restDayKeys.set(result.restDayKeys);
    void this.router.navigateByUrl('/');
  }

  private isExerciseSelected(exerciseId: string) {
    return this.selectedExercises().some((exercise) => exercise.exerciseId === exerciseId);
  }
  private getWorkoutExerciseName(exercise: WorkoutExerciseSummary) {
    return this.text().isPersian ? exercise.nameFa : exercise.nameEn;
  }
  private getTargetMuscleLabel(targetMuscle: string | undefined) {
    if (!targetMuscle) return '';
    return this.targetMuscles().find((muscle) => muscle.id === targetMuscle)?.label ?? targetMuscle;
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
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ items, total }) => {
          if (requestId !== this.exerciseSearchRequestId) return;
          this.exerciseSearchResults.update((results) =>
            offset === 0 ? items : [...results, ...items],
          );
          this.exerciseSearchTotal.set(total);
          this.isExerciseSearchLoading.set(false);
        },
        error: () => {
          if (requestId !== this.exerciseSearchRequestId) return;
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
    if (editingWorkoutId === undefined) return;
    const workout = this.workouts().find((candidate) => candidate.id === editingWorkoutId);
    if (!workout) {
      this.location.back();
      return;
    }
    this.workoutTitle.set(workout.name);
    this.selectedDate.set(getDateKey(workout.date));
    this.selectedExercises.set([...workout.exercises]);
    this.selectedTargetMuscle.set(workout.targetMuscle ?? workout.exercises[0]?.targetMuscle);
    this.recurrenceFrequency.set(
      workout.recurrence?.frequency ?? (workout.isWeeklyPlan ? 'weekly' : undefined),
    );
  }
  private getInitialSelectedDate() {
    const date = this.route.snapshot.queryParamMap.get('date');
    return date && isDateKey(date) ? date : getTodayDateKey();
  }
  private getInitialEditingWorkoutId() {
    const editId = Number(this.route.snapshot.queryParamMap.get('editId'));
    return Number.isInteger(editId) && editId > 0 ? editId : undefined;
  }
}
