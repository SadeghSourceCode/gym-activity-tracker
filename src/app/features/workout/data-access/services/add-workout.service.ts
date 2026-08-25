import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkoutCompletionStatus } from '../models/workout-planner.models';
import {
  CopiedWorkoutClipboard,
  Workout,
  WorkoutExerciseSection,
  WorkoutExerciseSummary,
  WorkoutSet,
} from '../models/workout-storage.models';
import { ExerciseLibraryService } from '../../../exercise-library/data-access/services/exercise-library.service';
import {
  Exercise,
  ExerciseSearchResult,
  TargetMuscleOption,
} from '../../../exercise-library/data-access/models/exercise.models';
import { parseDateKey } from '../../utils/calendar-date.util';
import { AddWorkoutSaveConfig } from '../models/add-workout-save-config.interface';

interface LegacyWorkoutSet extends Partial<WorkoutSet> {
  repeat?: number;
  weight?: number;
}

@Injectable({ providedIn: 'root' })
export class AddWorkoutService {
  private readonly storageKey = 'gym-activity-tracker.workouts';
  private readonly restDaysStorageKey = 'gym-activity-tracker.rest-days';
  private readonly exerciseLibrary = inject(ExerciseLibraryService);

  searchExercises(
    query: string,
    offset: number,
    limit: number,
    targetMuscle: string | undefined,
  ): Observable<ExerciseSearchResult> {
    return this.exerciseLibrary.search({ text: query, offset, limit, targetMuscle });
  }

  getTargetMuscles(): Observable<TargetMuscleOption[]> {
    return this.exerciseLibrary.getTargetMuscles();
  }

  canContinueToPlanning(selectedExercises: readonly WorkoutExerciseSummary[]): boolean {
    return selectedExercises.length > 0;
  }

  saveWorkoutFlow(
    isBrowser: boolean,
    workouts: Workout[],
    restDayKeys: string[],
    editingWorkoutId: number | undefined,
    config: AddWorkoutSaveConfig,
  ): { workouts: Workout[]; restDayKeys: string[] } {
    const nextWorkouts =
      editingWorkoutId === undefined
        ? this.createWorkout(workouts, config)
        : this.updateWorkout(workouts, editingWorkoutId, config);
    const nextRestDayKeys = restDayKeys.filter((dateKey) => dateKey !== config.selectedDate);

    this.saveWorkouts(isBrowser, nextWorkouts);
    this.saveRestDayKeys(isBrowser, nextRestDayKeys);

    return { workouts: nextWorkouts, restDayKeys: nextRestDayKeys };
  }

  loadWorkouts(isBrowser: boolean, isPersian: boolean): Workout[] {
    if (!isBrowser) {
      return [];
    }

    try {
      const storedWorkouts = localStorage.getItem(this.storageKey);
      const workouts = storedWorkouts ? (JSON.parse(storedWorkouts) as Workout[]) : [];

      return Array.isArray(workouts)
        ? workouts.map((workout) => ({
            ...workout,
            date: new Date(workout.date),
            exercises: this.normalizeWorkoutExercises(workout, isPersian),
            schemaVersion: 2 as const,
            recurrence: this.normalizeRecurrence(workout),
            sets: this.normalizeWorkoutSets(workout.sets),
            completionStatus: this.normalizeCompletionStatus(workout.completionStatus),
          }))
        : [];
    } catch {
      return [];
    }
  }

  saveWorkouts(isBrowser: boolean, workouts: Workout[]): void {
    if (isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(workouts));
    }
  }

  loadRestDayKeys(isBrowser: boolean): string[] {
    if (!isBrowser) {
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

  saveRestDayKeys(isBrowser: boolean, dateKeys: string[]): void {
    if (isBrowser) {
      localStorage.setItem(this.restDaysStorageKey, JSON.stringify(dateKeys));
    }
  }

  toggleExercise(
    selectedExercises: WorkoutExerciseSummary[],
    exercise: Exercise,
    section: WorkoutExerciseSection,
  ): WorkoutExerciseSummary[] {
    const selectedExercise = selectedExercises.find(
      (candidate) => candidate.exerciseId === exercise.id && candidate.section === section,
    );

    if (selectedExercise) {
      return this.reorderExercises(
        selectedExercises.filter((candidate) => candidate.id !== selectedExercise.id),
      );
    }

    return this.reorderExercises([
      ...selectedExercises,
      this.toWorkoutExerciseSummary(exercise, section, selectedExercises.length),
    ]);
  }

  mergeCopiedWorkout(
    selectedExercises: WorkoutExerciseSummary[],
    copiedWorkout: CopiedWorkoutClipboard,
  ): WorkoutExerciseSummary[] {
    const mergedExercises = [...selectedExercises];

    for (const copiedExercise of copiedWorkout.exercises) {
      if (!mergedExercises.some((exercise) => exercise.id === copiedExercise.id)) {
        mergedExercises.push({
          ...copiedExercise,
          sets: copiedExercise.sets.map((set) => ({ ...set })),
          exerciseId: copiedExercise.exerciseId ?? copiedExercise.id,
          order: mergedExercises.length,
          section: this.getExerciseSection(copiedExercise),
          trackingType: copiedExercise.trackingType ?? 'weight-and-repetitions',
        });
      }
    }

    return this.reorderExercises(mergedExercises);
  }

  updateExerciseSetCount(
    selectedExercises: WorkoutExerciseSummary[],
    exerciseId: string,
    setCount: number,
  ): WorkoutExerciseSummary[] {
    const normalizedSetCount = Math.max(Math.floor(setCount), 1);

    return selectedExercises.map((exercise) =>
      exercise.id === exerciseId
        ? { ...exercise, sets: this.resizeWorkoutSets(exercise.sets, normalizedSetCount) }
        : exercise,
    );
  }

  moveExercise(
    selectedExercises: WorkoutExerciseSummary[],
    exerciseId: string,
    direction: -1 | 1,
  ): WorkoutExerciseSummary[] {
    const index = selectedExercises.findIndex((exercise) => exercise.id === exerciseId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= selectedExercises.length) {
      return selectedExercises;
    }

    const reordered = [...selectedExercises];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    return this.reorderExercises(reordered);
  }

  reorderExercise(
    selectedExercises: WorkoutExerciseSummary[],
    exerciseId: string,
    targetExerciseId: string,
  ): WorkoutExerciseSummary[] {
    const sourceIndex = selectedExercises.findIndex((exercise) => exercise.id === exerciseId);
    const targetIndex = selectedExercises.findIndex((exercise) => exercise.id === targetExerciseId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return selectedExercises;

    const reordered = [...selectedExercises];
    const [movedExercise] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, movedExercise);
    return this.reorderExercises(reordered);
  }

  createWorkout(workouts: Workout[], config: AddWorkoutSaveConfig): Workout[] {
    const nextWorkoutId = Math.max(...workouts.map((workout) => workout.id), 0) + 1;
    const firstExercise = config.selectedExercises[0];

    return [
      ...workouts,
      {
        id: nextWorkoutId,
        schemaVersion: 2,
        name: config.workoutTitle.trim() || config.defaultWorkoutTitle,
        exerciseId: firstExercise.exerciseId,
        thumbnailUrl: firstExercise.thumbnailUrl,
        exercises: config.selectedExercises,
        date: parseDateKey(config.selectedDate),
        targetMuscle: config.targetMuscle,
        recurrence: config.recurrenceFrequency
          ? { frequency: config.recurrenceFrequency, interval: 1, occurrences: 4 }
          : undefined,
        completionStatus: 'pending',
        sets: [{ id: 1, reps: 0, weightKg: 0 }],
      },
    ];
  }

  updateWorkout(
    workouts: Workout[],
    editingWorkoutId: number,
    config: AddWorkoutSaveConfig,
  ): Workout[] {
    const firstExercise = config.selectedExercises[0];

    return workouts.map((workout) =>
      workout.id === editingWorkoutId
        ? {
            ...workout,
            name: config.workoutTitle.trim() || config.defaultWorkoutTitle,
            schemaVersion: 2,
            exerciseId: firstExercise.exerciseId,
            thumbnailUrl: firstExercise.thumbnailUrl,
            exercises: config.selectedExercises,
            date: parseDateKey(config.selectedDate),
            targetMuscle: config.targetMuscle,
            recurrence: config.recurrenceFrequency
              ? { frequency: config.recurrenceFrequency, interval: 1, occurrences: 4 }
              : undefined,
            isWeeklyPlan: undefined,
          }
        : workout,
    );
  }

  getWorkoutTargetMuscle(selectedExercises: WorkoutExerciseSummary[]): string {
    return [
      ...new Set(
        selectedExercises
          .map((exercise) => exercise.targetMuscle)
          .filter((targetMuscle): targetMuscle is string => Boolean(targetMuscle)),
      ),
    ].join(', ');
  }

  getExerciseSection(exercise: WorkoutExerciseSummary): WorkoutExerciseSection {
    return exercise.section === 'warmup' || exercise.section === 'cooldown'
      ? exercise.section
      : 'main';
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

  private normalizeWorkoutExercises(
    workout: Workout,
    isPersian: boolean,
  ): WorkoutExerciseSummary[] {
    if (Array.isArray(workout.exercises)) {
      return workout.exercises.map((exercise, index) => ({
        ...exercise,
        exerciseId: exercise.exerciseId ?? exercise.id,
        order: index,
        nameEn: exercise.nameEn ?? exercise.name,
        nameFa: exercise.nameFa ?? exercise.name,
        targetMuscle: exercise.targetMuscle ?? workout.targetMuscle,
        name: isPersian ? (exercise.nameFa ?? exercise.name) : (exercise.nameEn ?? exercise.name),
        trackingType: exercise.trackingType ?? 'weight-and-repetitions',
        sets: this.normalizeWorkoutSets(exercise.sets),
        section: this.getExerciseSection(exercise),
      }));
    }

    return workout.exerciseId
      ? [
          {
            id: `workout-exercise:${workout.id}:0`,
            exerciseId: workout.exerciseId,
            order: 0,
            name: workout.name,
            nameEn: workout.name,
            nameFa: workout.name,
            targetMuscle: workout.targetMuscle,
            thumbnailUrl: workout.thumbnailUrl,
            trackingType: 'weight-and-repetitions',
            sets: this.normalizeWorkoutSets(workout.sets),
            section: 'main',
          },
        ]
      : [];
  }

  private toWorkoutExerciseSummary(
    exercise: Exercise,
    section: WorkoutExerciseSection,
    order: number,
  ): WorkoutExerciseSummary {
    return {
      id: `workout-exercise:${exercise.id}:${section}:${order}`,
      exerciseId: exercise.id,
      order,
      section,
      trackingType: exercise.trackingType,
      name: exercise.name,
      nameEn: exercise.nameEn,
      nameFa: exercise.nameFa,
      targetMuscle: exercise.targetMuscle,
      thumbnailUrl: this.exerciseLibrary.getMediaUrl(exercise) ?? undefined,
      sets: [{ id: 1, reps: 0, weightKg: 0 }],
    };
  }

  private normalizeWorkoutSets(sets: LegacyWorkoutSet[] | undefined): WorkoutSet[] {
    if (!Array.isArray(sets)) {
      return [{ id: 1, reps: 0, weightKg: 0 }];
    }

    const normalizedSets = sets
      .filter((set): set is LegacyWorkoutSet & { id: number } => typeof set?.id === 'number')
      .map((set) => ({
        id: set.id,
        reps: typeof set.reps === 'number' ? set.reps : (set.repeat ?? 0),
        weightKg: typeof set.weightKg === 'number' ? set.weightKg : (set.weight ?? 0),
        durationSeconds: set.durationSeconds,
        distanceMeters: set.distanceMeters,
        assistanceWeightKg: set.assistanceWeightKg,
        restSeconds: set.restSeconds,
        completed: set.completed,
      }));

    return normalizedSets.length ? normalizedSets : [{ id: 1, reps: 0, weightKg: 0 }];
  }

  private resizeWorkoutSets(sets: WorkoutSet[] | undefined, setCount: number): WorkoutSet[] {
    const normalizedSets = this.normalizeWorkoutSets(sets);

    if (normalizedSets.length >= setCount) {
      return normalizedSets.slice(0, setCount);
    }

    const nextSets = [...normalizedSets];

    while (nextSets.length < setCount) {
      const nextSetId = Math.max(...nextSets.map((set) => set.id), 0) + 1;
      nextSets.push({ id: nextSetId, reps: 0, weightKg: 0 });
    }

    return nextSets;
  }

  private reorderExercises(exercises: WorkoutExerciseSummary[]): WorkoutExerciseSummary[] {
    return exercises.map((exercise, order) => ({ ...exercise, order }));
  }

  private normalizeRecurrence(workout: Workout) {
    if (workout.recurrence?.frequency === 'weekly' || workout.recurrence?.frequency === 'monthly') {
      return {
        frequency: 'weekly' as const,
        interval: Math.max(workout.recurrence.interval, 1),
        occurrences: Math.max(workout.recurrence.occurrences, 1),
      };
    }

    return workout.isWeeklyPlan
      ? { frequency: 'weekly' as const, interval: 1, occurrences: 4 }
      : undefined;
  }
}
