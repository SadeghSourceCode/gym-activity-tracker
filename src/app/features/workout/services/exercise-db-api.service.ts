import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';

export interface ExerciseDbExercise {
  id: string;
  name: string;
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
  private readonly exerciseDbUrl =
    'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';

  readonly imageBaseUrl =
    'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

  private readonly exercises$ = this.http.get<ExercisesDatasetExercise[]>(this.exerciseDbUrl).pipe(
    map((exercises) =>
      exercises
        .map((exercise) => this.toExerciseDbExercise(exercise))
        .sort((a, b) => a.name.localeCompare(b.name)),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  search(query: string, offset = 0, limit = 15): Observable<ExerciseSearchResult> {
    const normalizedQuery = query.trim().toLowerCase();

    return this.exercises$.pipe(
      map((exercises) => {
        const filteredExercises = normalizedQuery
          ? exercises.filter((exercise) => this.matchesExercise(exercise, normalizedQuery))
          : exercises;

        return {
          items: filteredExercises.slice(offset, offset + limit),
          total: filteredExercises.length,
        };
      }),
    );
  }

  getById(id: string): Observable<ExerciseDbExercise | null> {
    return this.exercises$.pipe(
      map((exercises) => exercises.find((exercise) => exercise.id === id) ?? null),
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
}
