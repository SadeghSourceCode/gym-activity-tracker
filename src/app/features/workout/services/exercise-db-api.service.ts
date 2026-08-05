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
  targetMuscle: string;
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

export interface TargetMuscleOption {
  id: string;
  label: string;
  mainMuscles: string;
  imageUrl: string;
  exerciseCount: number;
}

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
    id: 'biceps',
    label: 'Biceps',
    mainMuscles: 'Biceps, Brachialis',
    imageUrl: '/assets/images/muscle-groups/biceps.png',
    keywords: ['biceps', 'bicep', 'brachialis'],
  },
  {
    id: 'triceps',
    label: 'Triceps',
    mainMuscles: 'Triceps',
    imageUrl: '/assets/images/muscle-groups/tricept.png',
    keywords: ['triceps', 'tricep'],
  },
  {
    id: 'forearms',
    label: 'Forearms',
    mainMuscles: 'Grip, Wrist Flexors/Extensors',
    imageUrl: '/assets/images/muscle-groups/forearms.png',
    keywords: ['forearms', 'forearm', 'grip', 'wrist', 'flexors', 'extensors'],
  },
  {
    id: 'quadriceps',
    label: 'Quadriceps',
    mainMuscles: 'Front of thigh',
    imageUrl: '/assets/images/muscle-groups/legs.png',
    keywords: ['quadriceps', 'quads', 'quad', 'front thigh'],
  },
  {
    id: 'hamstrings',
    label: 'Hamstrings',
    mainMuscles: 'Back of thigh',
    imageUrl: '/assets/images/muscle-groups/legs.png',
    keywords: ['hamstrings', 'hamstring', 'back thigh'],
  },
  {
    id: 'glutes',
    label: 'Glutes',
    mainMuscles: 'Buttocks',
    imageUrl: '/assets/images/muscle-groups/legs.png',
    keywords: ['glutes', 'glute', 'buttocks', 'butt'],
  },
  {
    id: 'calves',
    label: 'Calves',
    mainMuscles: 'Gastrocnemius, Soleus',
    imageUrl: '/assets/images/muscle-groups/legs.png',
    keywords: ['calves', 'calf', 'gastrocnemius', 'soleus'],
  },
  {
    id: 'core',
    label: 'Core',
    mainMuscles: 'Abs, Obliques',
    imageUrl: '/assets/images/muscle-groups/core-abs.png',
    keywords: ['core', 'abs', 'abdominals', 'abdominal', 'obliques', 'oblique', 'waist'],
  },
  {
    id: 'lower-back',
    label: 'Lower Back',
    mainMuscles: 'Erector Spinae',
    imageUrl: '/assets/images/muscle-groups/lower-back.png',
    keywords: ['lower back', 'erector spinae', 'spinae'],
  },
  {
    id: 'cardio',
    label: 'Cardio',
    mainMuscles: 'Whole body/endurance',
    imageUrl: '/assets/images/muscle-groups/cardio.png',
    keywords: ['cardio', 'endurance', 'whole body', 'full body'],
  },
] as const;

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

  search(
    query: string,
    offset = 0,
    limit = 15,
    targetMuscle: string | null = null,
  ): Observable<ExerciseSearchResult> {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedTargetMuscle = targetMuscle?.trim().toLowerCase() ?? '';

    return this.exercises$.pipe(
      map((exercises) => {
        const localizedExercises = exercises.map((exercise) => this.localizeExercise(exercise));
        const muscleFilteredExercises = normalizedTargetMuscle
          ? localizedExercises.filter((exercise) => exercise.targetMuscle === normalizedTargetMuscle)
          : localizedExercises;
        const filteredExercises = normalizedQuery
          ? muscleFilteredExercises.filter((exercise) => this.matchesExercise(exercise, normalizedQuery))
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

        for (const exercise of exercises) {
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
    const targetMuscle = this.getTargetMuscleGroup(exercise);

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
    };
  }

  private localizeExercise(exercise: ExerciseDbExercise): ExerciseDbExercise {
    return {
      ...exercise,
      name: this.profilePreferences.language() === 'fa' ? exercise.nameFa : exercise.nameEn,
    };
  }

  private getTargetMuscleGroup(exercise: ExercisesDatasetExercise): string {
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

    return matchingGroups[0]?.group.id ?? 'cardio';
  }
}
