import { isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';

interface WorkoutSet {
  id: number;
  repeat: number;
  weight: number;
}

interface Workout {
  id: number;
  name: string;
  date: Date;
  sets: WorkoutSet[];
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
})
export class MainComponent {
  private readonly storageKey = 'gym-activity-tracker.workouts';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  workouts = signal<Workout[]>(this.loadWorkouts());

  private readonly saveWorkouts = effect(() => {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.workouts()));
    } catch {
      // Keep the app usable when storage is unavailable or full.
    }
  });

  private loadWorkouts(): Workout[] {
    if (!this.isBrowser) {
      return [];
    }

    try {
      const storedWorkouts = localStorage.getItem(this.storageKey);

      if (!storedWorkouts) {
        return [];
      }

      const workouts = JSON.parse(storedWorkouts) as Workout[];

      if (!Array.isArray(workouts)) {
        return [];
      }

      return workouts.map((workout) => ({
        ...workout,
        date: new Date(workout.date),
        sets: Array.isArray(workout.sets) ? workout.sets : [],
      }));
    } catch {
      return [];
    }
  }

  addWorkout() {
    this.workouts.update((workouts) => {
      const nextWorkoutId = Math.max(...workouts.map((workout) => workout.id), 0) + 1;

      return [
        ...workouts,
        {
          id: nextWorkoutId,
          name: `workout ${nextWorkoutId}`,
          date: new Date(),
          sets: [{ id: 1, repeat: 0, weight: 0 }],
        },
      ];
    });
  }

  updateWorkoutName(workoutId: number, name: string) {
    this.workouts.update((workouts) =>
      workouts.map((workout) => (workout.id === workoutId ? { ...workout, name } : workout)),
    );
  }

  removeWorkout(workoutId: number) {
    this.workouts.update((workouts) =>
      workouts.filter((workout) => workout.id !== workoutId),
    );
  }

  addSet(workoutId: number) {
    this.workouts.update((workouts) =>
      workouts.map((workout) => {
        if (workout.id !== workoutId) {
          return workout;
        }

        const nextSetId = Math.max(...workout.sets.map((set) => set.id), 0) + 1;

        return {
          ...workout,
          sets: [
            ...workout.sets,
            {
              id: nextSetId,
              repeat: 0,
              weight: 0,
            },
          ],
        };
      }),
    );
  }

  updateSet(
    workoutId: number,
    setId: number,
    changes: Partial<Pick<WorkoutSet, 'repeat' | 'weight'>>,
  ) {
    this.workouts.update((workouts) =>
      workouts.map((workout) => {
        if (workout.id !== workoutId) {
          return workout;
        }

        return {
          ...workout,
          sets: workout.sets.map((set) => (set.id === setId ? { ...set, ...changes } : set)),
        };
      }),
    );
  }
}
