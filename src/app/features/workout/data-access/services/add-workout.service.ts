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
import {
  ExerciseDbApiService,
  ExerciseDbExercise,
  ExerciseSearchResult,
  TargetMuscleOption,
} from './exercise-db-api.service';
import { parseDateKey } from '../../utils/calendar-date.util';
import { AddWorkoutSaveConfig } from '../models/add-workout-save-config.interface';

@Injectable({ providedIn: 'root' })
export class AddWorkoutService {
  private readonly storageKey = 'gym-activity-tracker.workouts';
  private readonly restDaysStorageKey = 'gym-activity-tracker.rest-days';
  private readonly exerciseDbApi = inject(ExerciseDbApiService);

  readonly imageBaseUrl = this.exerciseDbApi.imageBaseUrl;

  searchExercises(
    query: string,
    offset: number,
    limit: number,
    targetMuscle: string | undefined,
    section: WorkoutExerciseSection | undefined,
  ): Observable<ExerciseSearchResult> {
    return this.exerciseDbApi.search(query, offset, limit, targetMuscle, section);
  }

  getTargetMuscles(): Observable<TargetMuscleOption[]> {
    return this.exerciseDbApi.getTargetMuscles();
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
            sets: Array.isArray(workout.sets) ? workout.sets : [],
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
    exercise: ExerciseDbExercise,
    imageBaseUrl: string,
  ): WorkoutExerciseSummary[] {
    const selectedExercise = selectedExercises.find((candidate) => candidate.id === exercise.id);

    if (selectedExercise) {
      return selectedExercises.filter((candidate) => candidate.id !== exercise.id);
    }

    return [...selectedExercises, this.toWorkoutExerciseSummary(exercise, imageBaseUrl)];
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
          section: this.getExerciseSection(copiedExercise),
        });
      }
    }

    return mergedExercises;
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

  createWorkout(workouts: Workout[], config: AddWorkoutSaveConfig): Workout[] {
    const nextWorkoutId = Math.max(...workouts.map((workout) => workout.id), 0) + 1;
    const firstExercise = config.selectedExercises[0];

    return [
      ...workouts,
      {
        id: nextWorkoutId,
        name: config.workoutTitle.trim() || config.defaultWorkoutTitle,
        exerciseId: firstExercise.id,
        thumbnailUrl: firstExercise.thumbnailUrl,
        exercises: config.selectedExercises,
        date: parseDateKey(config.selectedDate),
        targetMuscle: config.targetMuscle,
        isWeeklyPlan: config.isWeeklyPlan,
        completionStatus: 'pending',
        sets: [{ id: 1, repeat: 0, weight: 0 }],
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
            exerciseId: firstExercise.id,
            thumbnailUrl: firstExercise.thumbnailUrl,
            exercises: config.selectedExercises,
            date: parseDateKey(config.selectedDate),
            targetMuscle: config.targetMuscle,
            isWeeklyPlan: config.isWeeklyPlan,
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
      return workout.exercises.map((exercise) => ({
        ...exercise,
        nameEn: exercise.nameEn ?? exercise.name,
        nameFa: exercise.nameFa ?? exercise.name,
        targetMuscle: exercise.targetMuscle ?? workout.targetMuscle,
        name: isPersian ? (exercise.nameFa ?? exercise.name) : (exercise.nameEn ?? exercise.name),
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

  private toWorkoutExerciseSummary(
    exercise: ExerciseDbExercise,
    imageBaseUrl: string,
  ): WorkoutExerciseSummary {
    const mediaPath = exercise.gifUrl ?? exercise.images[0];

    return {
      id: exercise.id,
      name: exercise.name,
      nameEn: exercise.nameEn,
      nameFa: exercise.nameFa,
      targetMuscle: exercise.targetMuscle,
      thumbnailUrl: mediaPath ? imageBaseUrl + mediaPath : undefined,
      sets: [{ id: 1, repeat: 0, weight: 0 }],
      section: exercise.section,
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
}
