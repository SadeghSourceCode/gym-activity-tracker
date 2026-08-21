import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, forkJoin, from, map, of, shareReplay, switchMap, tap } from 'rxjs';
import { ProfilePreferencesService } from '../../../profile/data-access/services/profile-preferences.service';
import { normalizeExerciseSearchText } from '../../../workout/utils/exercise-search-normalizer.util';
import { translateExerciseNameToPersian } from '../../../workout/utils/exercise-persian-name.util';
import {
  Exercise,
  ExerciseDifficulty,
  ExerciseMediaAsset,
  ExerciseSearchQuery,
  ExerciseSearchResult,
  ExerciseTrackingType,
  TargetMuscleOption,
} from '../models/exercise.models';

interface LegacyDatasetExercise {
  id: string;
  name: string;
  category: string;
  body_part: string;
  equipment: string;
  instructions: { en?: string };
  instruction_steps?: { en?: string[] };
  muscle_group: string;
  secondary_muscles: string[];
  target: string;
  image: string;
  gif_url: string;
  media_id?: string;
  created_at?: string;
  attribution?: string;
}

interface ExerciseCacheRecord {
  version: number;
  cachedAt: number;
  exercises: Exercise[];
}

const DATASET_URLS = [
  'assets/exercises/warm-up-exercises.json',
  'assets/exercises/main-exercises.json',
  'assets/exercises/cooldown-exercises.json',
] as const;

const MEDIA_BASE_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

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
export class ExerciseLibraryService {
  readonly imageBaseUrl = MEDIA_BASE_URL;
  private readonly cacheDatabaseName = 'gym-activity-tracker';
  private readonly cacheStoreName = 'exercise-library-cache';
  private readonly cacheKey = 'exercises';
  private readonly cacheVersion = 1;
  private readonly cacheMaxAge = 30 * 24 * 60 * 60 * 1000;
  private readonly http = inject(HttpClient);
  private readonly profilePreferences = inject(ProfilePreferencesService);

  private readonly exercises$ = defer(() => from(this.readCachedExercises())).pipe(
    switchMap((cached) => (cached ? of(cached) : this.fetchAndCacheExercises())),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  search(query: ExerciseSearchQuery = {}): Observable<ExerciseSearchResult> {
    const text = normalizeExerciseSearchText(query.text ?? '');
    const targetMuscle = query.targetMuscle?.trim().toLowerCase() ?? '';
    const equipment = query.equipment?.trim().toLowerCase() ?? '';
    const offset = Math.max(query.offset ?? 0, 0);
    const limit = Math.max(query.limit ?? 15, 0);

    return this.exercises$.pipe(
      map((exercises) => {
        const items = exercises
          .map((exercise) => this.localizeExercise(exercise))
          .filter((exercise) => !targetMuscle || exercise.targetMuscle === targetMuscle)
          .filter(
            (exercise) =>
              !equipment || exercise.equipment.some((value) => value.toLowerCase() === equipment),
          )
          .filter((exercise) => !query.difficulty || exercise.difficulty === query.difficulty)
          .filter((exercise) => !query.trackingType || exercise.trackingType === query.trackingType)
          .filter((exercise) => !text || this.matchesExercise(exercise, text));

        return { items: items.slice(offset, offset + limit), total: items.length };
      }),
    );
  }

  getById(id: string): Observable<Exercise | null> {
    return this.exercises$.pipe(
      map((items) => {
        const exercise = items.find(
          (candidate) => candidate.id === id || candidate.sourceId === id,
        );
        return exercise ? this.localizeExercise(exercise) : null;
      }),
    );
  }

  getSimilar(exercise: Exercise, limit = 6): Observable<Exercise[]> {
    const muscles = new Set(
      [...exercise.primaryMuscles, ...exercise.secondaryMuscles].map((value) =>
        value.toLowerCase(),
      ),
    );
    return this.exercises$.pipe(
      map((items) =>
        items
          .filter((candidate) => candidate.id !== exercise.id)
          .map((candidate) => ({
            exercise: this.localizeExercise(candidate),
            score: this.similarityScore(exercise, candidate, muscles),
          }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
          .slice(0, limit)
          .map(({ exercise: candidate }) => candidate),
      ),
    );
  }

  getTargetMuscles(): Observable<TargetMuscleOption[]> {
    return this.exercises$.pipe(
      map((exercises) => {
        const counts = new Map<string, number>();
        exercises.forEach((exercise) =>
          counts.set(exercise.targetMuscle, (counts.get(exercise.targetMuscle) ?? 0) + 1),
        );
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

  getMediaUrl(
    exercise: Exercise,
    preferredKind: 'animation' | 'image' = 'animation',
  ): string | null {
    const media = exercise.media.find((asset) => asset.kind === preferredKind) ?? exercise.media[0];
    if (!media) return null;
    return /^(https?:)?\/\//.test(media.url) ? media.url : MEDIA_BASE_URL + media.url;
  }

  private fetchAndCacheExercises(): Observable<Exercise[]> {
    return forkJoin(DATASET_URLS.map((url) => this.http.get<LegacyDatasetExercise[]>(url))).pipe(
      map((groups) => {
        const exercisesById = new Map<string, Exercise>();
        groups.flat().forEach((item) => {
          const exercise = this.fromLegacyDataset(item);
          if (exercise && !exercisesById.has(exercise.id)) exercisesById.set(exercise.id, exercise);
        });
        return [...exercisesById.values()].sort((a, b) => a.nameEn.localeCompare(b.nameEn));
      }),
      tap((exercises) => void this.writeCachedExercises(exercises)),
    );
  }

  private fromLegacyDataset(item: LegacyDatasetExercise): Exercise | null {
    const targetMuscle = this.getTargetMuscleGroup(item);
    if (!targetMuscle) return null;

    const primaryMuscles = [...new Set([item.target, item.muscle_group].filter(Boolean))];
    const instructions =
      item.instruction_steps?.en?.filter(Boolean) ??
      item.instructions.en
        ?.split(/\r?\n|(?<=[.!?])\s+/)
        .map((step) => step.trim())
        .filter(Boolean) ??
      [];
    const media = this.toMedia(item);

    return {
      id: `legacy-dataset:${item.id}`,
      name: item.name,
      nameEn: item.name,
      nameFa: translateExerciseNameToPersian(item.name),
      aliases: [],
      difficulty: this.inferDifficulty(item),
      equipment: item.equipment ? [item.equipment] : [],
      primaryMuscles,
      secondaryMuscles: [...new Set(item.secondary_muscles ?? [])],
      instructions,
      media,
      trackingType: this.inferTrackingType(item),
      category: item.category || item.body_part,
      targetMuscle,
      source: 'hasaneyldrm/exercises-dataset',
      sourceId: item.id,
      license: {
        name: 'Source dataset terms; verify before redistribution',
        attributionRequired: true,
      },
      provenance: {
        dataset: 'hasaneyldrm/exercises-dataset',
        importedAt: item.created_at,
        originalAttribution: item.attribution,
        transformations: [
          'normalized muscle groups',
          'split instructions into steps',
          'generated Persian display name',
          'namespaced source identifier',
        ],
      },
    };
  }

  private toMedia(item: LegacyDatasetExercise): ExerciseMediaAsset[] {
    const assets: ExerciseMediaAsset[] = [];
    if (item.image)
      assets.push({
        id: `${item.media_id ?? item.id}:image`,
        kind: 'image',
        role: 'instructional',
        url: item.image,
        alt: item.name,
        attribution: item.attribution,
      });
    if (item.gif_url)
      assets.push({
        id: `${item.media_id ?? item.id}:animation`,
        kind: 'animation',
        role: 'instructional',
        url: item.gif_url,
        mimeType: 'image/gif',
        posterUrl: item.image || undefined,
        alt: item.name,
        attribution: item.attribution,
      });
    return assets;
  }

  private inferDifficulty(item: LegacyDatasetExercise): ExerciseDifficulty {
    const value = `${item.name} ${item.category}`.toLowerCase();
    return /advanced|one arm|pistol|handstand/.test(value)
      ? 'advanced'
      : /assisted|beginner/.test(value)
        ? 'beginner'
        : 'unknown';
  }

  private inferTrackingType(item: LegacyDatasetExercise): ExerciseTrackingType {
    const value = `${item.category} ${item.body_part} ${item.name}`.toLowerCase();
    if (/stretch|hold|plank|yoga/.test(value)) return 'duration';
    if (/run|walk|cycle|rowing|distance/.test(value)) return 'distance-and-duration';
    return item.equipment && item.equipment !== 'body weight'
      ? 'weight-and-repetitions'
      : 'repetitions';
  }

  private matchesExercise(exercise: Exercise, query: string): boolean {
    return [
      exercise.name,
      exercise.nameEn,
      exercise.nameFa,
      ...exercise.aliases,
      exercise.category,
      exercise.targetMuscle,
      ...exercise.equipment,
      ...exercise.primaryMuscles,
      ...exercise.secondaryMuscles,
    ].some((value) => normalizeExerciseSearchText(value).includes(query));
  }

  private similarityScore(
    source: Exercise,
    candidate: Exercise,
    sourceMuscles: Set<string>,
  ): number {
    let score = candidate.category === source.category ? 4 : 0;
    if (candidate.trackingType === source.trackingType) score += 2;
    if (candidate.equipment.some((equipment) => source.equipment.includes(equipment))) score += 1;
    [...candidate.primaryMuscles, ...candidate.secondaryMuscles].forEach((muscle) => {
      if (sourceMuscles.has(muscle.toLowerCase())) score += 2;
    });
    return score;
  }

  private localizeExercise(exercise: Exercise): Exercise {
    return {
      ...exercise,
      name: this.profilePreferences.language() === 'fa' ? exercise.nameFa : exercise.nameEn,
    };
  }

  private getTargetMuscleGroup(item: LegacyDatasetExercise): string | null {
    const text = [
      item.target,
      item.muscle_group,
      item.body_part,
      item.category,
      item.name,
      ...(item.secondary_muscles ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (/\b(cardio|cardiovascular|endurance)\b/.test(text)) return null;
    return (
      TARGET_MUSCLE_GROUPS.map((group) => ({
        group,
        length: Math.max(
          0,
          ...group.keywords
            .filter((keyword) => text.includes(keyword))
            .map((keyword) => keyword.length),
        ),
      }))
        .filter(({ length }) => length > 0)
        .sort((a, b) => b.length - a.length)[0]?.group.id ?? null
    );
  }

  private async readCachedExercises(): Promise<Exercise[] | null> {
    if (typeof indexedDB === 'undefined') return null;
    try {
      const database = await this.openCacheDatabase();
      const record = await new Promise<ExerciseCacheRecord | undefined>((resolve, reject) => {
        const request = database
          .transaction(this.cacheStoreName, 'readonly')
          .objectStore(this.cacheStoreName)
          .get(this.cacheKey);
        request.onsuccess = () => resolve(request.result as ExerciseCacheRecord | undefined);
        request.onerror = () => reject(request.error);
      });
      database.close();
      return record &&
        record.version === this.cacheVersion &&
        Date.now() - record.cachedAt < this.cacheMaxAge &&
        Array.isArray(record.exercises)
        ? record.exercises
        : null;
    } catch {
      return null;
    }
  }

  private async writeCachedExercises(exercises: Exercise[]): Promise<void> {
    if (typeof indexedDB === 'undefined') return;
    try {
      const database = await this.openCacheDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(this.cacheStoreName, 'readwrite');
        transaction
          .objectStore(this.cacheStoreName)
          .put(
            {
              version: this.cacheVersion,
              cachedAt: Date.now(),
              exercises,
            } satisfies ExerciseCacheRecord,
            this.cacheKey,
          );
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      database.close();
    } catch {
      /* IndexedDB may be unavailable in private browsing. */
    }
  }

  private openCacheDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.cacheDatabaseName, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(this.cacheStoreName))
          request.result.createObjectStore(this.cacheStoreName);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Exercise library cache database is blocked.'));
    });
  }
}
