import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, forkJoin, from, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { WorkoutExerciseSection } from '../models/workout-storage.models';
import { normalizeExerciseSearchText } from '../../utils/exercise-search-normalizer.util';
import { ProfilePreferencesService } from '../../../profile/data-access/services/profile-preferences.service';
import { translateExerciseNameToPersian } from '../../utils/exercise-persian-name.util';

export interface ExerciseDbExercise {
  id: string;
  name: string;
  nameEn: string;
  nameFa: string;
  targetMuscle: string;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
  gifUrl: string | null;
  section: WorkoutExerciseSection;
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

interface ExercisesCacheRecord {
  version: number;
  cachedAt: number;
  exercises: ExerciseDbExercise[];
}

export interface ExerciseSearchResult {
  items: ExerciseDbExercise[];
  total: number;
}

export interface TargetMuscleOption {
  id: string;
  label: string;
  mainMuscles: string;
  imageUrl: string;
  exerciseCount: number;
}

interface ExerciseDatasetSource {
  url: string;
  section: WorkoutExerciseSection;
}

const EXERCISE_DATASET_SOURCES: readonly ExerciseDatasetSource[] = [
  { url: 'assets/exercises/warm-up-exercises.json', section: 'warmup' },
  { url: 'assets/exercises/main-exercises.json', section: 'main' },
  { url: 'assets/exercises/cooldown-exercises.json', section: 'cooldown' },
];

const TARGET_MUSCLE_GROUPS = [
  {
    id: 'chest',
    label: 'Chest',
    mainMuscles: 'Pectorals',
    imageUrl: '/assets/images/muscle-groups/chest.png',
    keywords: ['chest', 'pectorals', 'pectoralis'],
  },
  {
    id: 'back',
    label: 'Back',
    mainMuscles: 'Lats, Traps, Rhomboids',
    imageUrl: '/assets/images/muscle-groups/back.png',
    keywords: ['back', 'lats', 'latissimus', 'traps', 'trapezius', 'rhomboids'],
  },
  {
    id: 'shoulders',
    label: 'Shoulders',
    mainMuscles: 'Deltoids',
    imageUrl: '/assets/images/muscle-groups/shoulder.png',
    keywords: ['shoulders', 'shoulder', 'deltoids', 'deltoid'],
  },
  {
    id: 'arms',
    label: 'Arms',
    mainMuscles: 'Biceps, Triceps, Forearms',
    imageUrl: '/assets/images/muscle-groups/biceps.png',
    keywords: [
      'biceps',
      'bicep',
      'brachialis',
      'triceps',
      'tricep',
      'forearms',
      'forearm',
      'grip',
      'wrist',
      'flexors',
      'extensors',
    ],
  },
  {
    id: 'legs',
    label: 'Leg',
    mainMuscles: 'Quadriceps, Hamstrings, Glutes, Calves',
    imageUrl: '/assets/images/muscle-groups/legs.png',
    keywords: [
      'quadriceps',
      'quads',
      'quad',
      'front thigh',
      'hamstrings',
      'hamstring',
      'back thigh',
      'glutes',
      'glute',
      'buttocks',
      'butt',
      'calves',
      'calf',
      'gastrocnemius',
      'soleus',
    ],
  },
  {
    id: 'core',
    label: 'Core',
    mainMuscles: 'Abs, Obliques, Lower Back',
    imageUrl: '/assets/images/muscle-groups/core-abs.png',
    keywords: [
      'core',
      'abs',
      'abdominals',
      'abdominal',
      'obliques',
      'oblique',
      'waist',
      'lower back',
      'erector spinae',
      'spinae',
    ],
  },
] as const;

@Injectable({ providedIn: 'root' })
export class ExerciseDbApiService {
  private readonly cacheDatabaseName = 'gym-activity-tracker';
  private readonly cacheStoreName = 'exercise-cache';
  private readonly cacheKey = 'exercises';
  private readonly cacheVersion = 3;
  private readonly cacheMaxAge = 30 * 24 * 60 * 60 * 1000;
  private readonly http = inject(HttpClient);
  private readonly profilePreferences = inject(ProfilePreferencesService);
  readonly imageBaseUrl = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

  private readonly exercises$ = defer(() => from(this.readCachedExercises())).pipe(
    switchMap((cachedExercises) =>
      cachedExercises ? of(cachedExercises) : this.fetchAndCacheExercises(),
    ),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  search(
    query: string,
    offset = 0,
    limit = 15,
    targetMuscle: string | null = null,
    section: WorkoutExerciseSection | null = null,
  ): Observable<ExerciseSearchResult> {
    const normalizedQuery = normalizeExerciseSearchText(query);
    const normalizedTargetMuscle = targetMuscle?.trim().toLowerCase() ?? '';

    return this.exercises$.pipe(
      map((exercises) => {
        const localizedExercises = exercises.map((exercise) => this.localizeExercise(exercise));
        const sectionFilteredExercises = section
          ? localizedExercises.filter((exercise) => exercise.section === section)
          : localizedExercises;
        const muscleFilteredExercises = normalizedTargetMuscle
          ? sectionFilteredExercises.filter(
              (exercise) => exercise.targetMuscle === normalizedTargetMuscle,
            )
          : sectionFilteredExercises;
        const filteredExercises = normalizedQuery
          ? muscleFilteredExercises.filter((exercise) =>
              this.matchesExercise(exercise, normalizedQuery),
            )
          : muscleFilteredExercises;

        return {
          items: filteredExercises.slice(offset, offset + limit),
          total: filteredExercises.length,
        };
      }),
    );
  }

  getTargetMuscles(): Observable<TargetMuscleOption[]> {
    return this.exercises$.pipe(
      map((exercises) => {
        const counts = new Map<string, number>();

        for (const exercise of exercises.filter((candidate) => candidate.section === 'main')) {
          counts.set(exercise.targetMuscle, (counts.get(exercise.targetMuscle) ?? 0) + 1);
        }

        return TARGET_MUSCLE_GROUPS.map(({ id, label, mainMuscles, imageUrl }) => ({
          id,
          label,
          mainMuscles,
          imageUrl,
          exerciseCount: counts.get(id) ?? 0,
        }));
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

  private fetchAndCacheExercises(): Observable<ExerciseDbExercise[]> {
    return forkJoin(
      EXERCISE_DATASET_SOURCES.map(({ url, section }) =>
        this.http
          .get<ExercisesDatasetExercise[]>(url)
          .pipe(map((exercises) => exercises.map((exercise) => ({ exercise, section })))),
      ),
    ).pipe(
      map((exerciseGroups) =>
        exerciseGroups
          .flat()
          .map(({ exercise, section }) => this.toExerciseDbExercise(exercise, section))
          .filter((exercise): exercise is ExerciseDbExercise => exercise !== null)
          .sort((a, b) => a.nameEn.localeCompare(b.nameEn)),
      ),
      tap((exercises) => void this.writeCachedExercises(exercises)),
    );
  }

  private async readCachedExercises(): Promise<ExerciseDbExercise[] | null> {
    if (typeof indexedDB === 'undefined') {
      return null;
    }

    try {
      const database = await this.openCacheDatabase();
      const record = await new Promise<ExercisesCacheRecord | undefined>((resolve, reject) => {
        const request = database
          .transaction(this.cacheStoreName, 'readonly')
          .objectStore(this.cacheStoreName)
          .get(this.cacheKey);

        request.onsuccess = () => resolve(request.result as ExercisesCacheRecord | undefined);
        request.onerror = () => reject(request.error);
      });
      database.close();

      if (
        !record ||
        record.version !== this.cacheVersion ||
        Date.now() - record.cachedAt >= this.cacheMaxAge ||
        !Array.isArray(record.exercises)
      ) {
        return null;
      }

      return record.exercises;
    } catch {
      return null;
    }
  }

  private async writeCachedExercises(exercises: ExerciseDbExercise[]): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      return;
    }

    try {
      const database = await this.openCacheDatabase();

      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(this.cacheStoreName, 'readwrite');

        transaction.objectStore(this.cacheStoreName).put(
          {
            version: this.cacheVersion,
            cachedAt: Date.now(),
            exercises,
          } satisfies ExercisesCacheRecord,
          this.cacheKey,
        );
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      database.close();
    } catch {
      // IndexedDB can be unavailable in private browsing or restricted environments.
    }
  }

  private openCacheDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.cacheDatabaseName, 1);

      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(this.cacheStoreName)) {
          request.result.createObjectStore(this.cacheStoreName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Exercise cache database is blocked.'));
    });
  }

  private matchesExercise(exercise: ExerciseDbExercise, query: string): boolean {
    return [
      exercise.name,
      exercise.nameEn,
      exercise.nameFa,
      exercise.category,
      exercise.targetMuscle,
      exercise.equipment,
      ...exercise.primaryMuscles,
      ...exercise.secondaryMuscles,
    ].some((value) => value && normalizeExerciseSearchText(value).includes(query));
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

  private toExerciseDbExercise(
    exercise: ExercisesDatasetExercise,
    section: WorkoutExerciseSection,
  ): ExerciseDbExercise | null {
    const targetMuscle = this.getTargetMuscleGroup(exercise);

    if (!targetMuscle) {
      return null;
    }

    return {
      id: exercise.id,
      name: exercise.name,
      nameEn: exercise.name,
      nameFa: translateExerciseNameToPersian(exercise.name),
      targetMuscle,
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
      section,
    };
  }

  private localizeExercise(exercise: ExerciseDbExercise): ExerciseDbExercise {
    return {
      ...exercise,
      name: this.profilePreferences.language() === 'fa' ? exercise.nameFa : exercise.nameEn,
    };
  }

  private getTargetMuscleGroup(exercise: ExercisesDatasetExercise): string | null {
    const searchableText = [
      exercise.target,
      exercise.muscle_group,
      exercise.body_part,
      exercise.category,
      exercise.name,
      ...(exercise.secondary_muscles ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (/\b(cardio|cardiovascular|endurance)\b/.test(searchableText)) {
      return null;
    }

    const matchingGroups = TARGET_MUSCLE_GROUPS.map((group) => ({
      group,
      matchedKeywordLength: Math.max(
        0,
        ...group.keywords
          .filter((keyword) => searchableText.includes(keyword))
          .map((keyword) => keyword.length),
      ),
    }))
      .filter(({ matchedKeywordLength }) => matchedKeywordLength > 0)
      .sort((a, b) => b.matchedKeywordLength - a.matchedKeywordLength);

    return matchingGroups[0]?.group.id ?? null;
  }
}
