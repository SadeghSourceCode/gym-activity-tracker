import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { ProfilePreferencesService } from '../../profile/data-access/services/profile-preferences.service';
import { translateExerciseNameToPersian } from '../utils/exercise-persian-name.util';

export interface ExerciseDbExercise {
  id: string;
  name: string;
  nameEn: string;
  nameFa: string;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
  gifUrl: string | null;
}

interface ExercisesDatasetExercise {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  instructions: {
    en?: string;
    tr?: string;
  };
  muscle_group: string;
  secondary_muscles: string[];
  target: string;
  image: string;
  gif_url: string;
  created_at: string;
}

export interface ExerciseSearchResult {
  items: ExerciseDbExercise[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ExerciseDbApiService {
  private readonly http = inject(HttpClient);
  private readonly profilePreferences = inject(ProfilePreferencesService);
  private readonly exerciseDbUrl =
    'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';

  readonly imageBaseUrl =
    'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

  private readonly exercises$ = this.http.get<ExercisesDatasetExercise[]>(this.exerciseDbUrl).pipe(
    map((exercises) =>
      exercises
        .map((exercise) => this.toExerciseDbExercise(exercise))
        .sort((a, b) => a.nameEn.localeCompare(b.nameEn)),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  search(query: string, offset = 0, limit = 15): Observable<ExerciseSearchResult> {
    const normalizedQuery = query.trim().toLowerCase();

    return this.exercises$.pipe(
      map((exercises) => {
        const localizedExercises = exercises.map((exercise) => this.localizeExercise(exercise));
        const filteredExercises = normalizedQuery
          ? localizedExercises.filter((exercise) => this.matchesExercise(exercise, normalizedQuery))
          : localizedExercises;

        return {
          items: filteredExercises.slice(offset, offset + limit),
          total: filteredExercises.length,
        };
      }),
    );
  }

  getById(id: string): Observable<ExerciseDbExercise | null> {
    return this.exercises$.pipe(
      map((exercises) => {
        const exercise = exercises.find((candidate) => candidate.id === id);

        return exercise ? this.localizeExercise(exercise) : null;
      }),
    );
  }

  getSimilar(exercise: ExerciseDbExercise, limit = 6): Observable<ExerciseDbExercise[]> {
    const comparableMuscles = new Set([
      ...exercise.primaryMuscles.map((muscle) => muscle.toLowerCase()),
      ...exercise.secondaryMuscles.map((muscle) => muscle.toLowerCase()),
    ]);

    return this.exercises$.pipe(
      map((exercises) =>
        exercises
          .map((exercise) => this.localizeExercise(exercise))
          .filter((candidate) => candidate.id !== exercise.id)
          .map((candidate) => ({
            exercise: candidate,
            score: this.getSimilarityScore(exercise, candidate, comparableMuscles),
          }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
          .slice(0, limit)
          .map(({ exercise }) => exercise),
      ),
    );
  }

  private matchesExercise(exercise: ExerciseDbExercise, query: string): boolean {
    return [
      exercise.name,
      exercise.nameEn,
      exercise.nameFa,
      exercise.category,
      exercise.equipment,
      ...exercise.primaryMuscles,
      ...exercise.secondaryMuscles,
    ].some((value) => value?.toLowerCase().includes(query));
  }

  private getSimilarityScore(
    source: ExerciseDbExercise,
    candidate: ExerciseDbExercise,
    sourceMuscles: Set<string>,
  ): number {
    let score = 0;

    if (candidate.category === source.category) {
      score += 4;
    }

    if (candidate.equipment && candidate.equipment === source.equipment) {
      score += 1;
    }

    for (const muscle of [...candidate.primaryMuscles, ...candidate.secondaryMuscles]) {
      if (sourceMuscles.has(muscle.toLowerCase())) {
        score += 2;
      }
    }

    return score;
  }

  private toExerciseDbExercise(exercise: ExercisesDatasetExercise): ExerciseDbExercise {
    return {
      id: exercise.id,
      name: exercise.name,
      nameEn: exercise.name,
      nameFa: translateExerciseNameToPersian(exercise.name),
      equipment: exercise.equipment,
      primaryMuscles: [exercise.target, exercise.muscle_group].filter(Boolean),
      secondaryMuscles: exercise.secondary_muscles ?? [],
      instructions: exercise.instructions.en
        ? exercise.instructions.en
            .split(/\r?\n/)
            .map((instruction) => instruction.trim())
            .filter(Boolean)
        : [],
      category: exercise.category || exercise.body_part,
      images: exercise.image ? [exercise.image] : [],
      gifUrl: exercise.gif_url || null,
    };
  }

  private localizeExercise(exercise: ExerciseDbExercise): ExerciseDbExercise {
    return {
      ...exercise,
      name: this.profilePreferences.language() === 'fa' ? exercise.nameFa : exercise.nameEn,
    };
  }
}
