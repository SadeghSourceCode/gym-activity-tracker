
import { Component, signal } from '@angular/core';

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

  workouts = signal<Workout[]>([
    {
      id: 1,
      name: 'workout 1',
      date: new Date(),
      sets: [{ id: 1, repeat: 0, weight: 0 }],
    },
    {
      id: 2,
      name: 'workout 2',
      date: new Date(),
      sets: [{ id: 1, repeat: 0, weight: 0 }],
    },
    {
      id: 3,
      name: 'workout 3',
      date: new Date(),
      sets: [{ id: 1, repeat: 0, weight: 0 }],
    },

  ])

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
          sets: workout.sets.map((set) =>
            set.id === setId ? { ...set, ...changes } : set,
          ),
        };
      }),
    );
  }

}
