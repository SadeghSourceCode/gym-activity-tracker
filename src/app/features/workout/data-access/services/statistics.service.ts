import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Workout } from '../models/workout-storage.models';


@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly storageKey = 'gym-activity-tracker.workouts';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  loadWorkouts(): Workout[] {
    if (!this.isBrowser) return [];

    try {
      const value = localStorage.getItem(this.storageKey);
      if (!value) return [];
      const workouts = JSON.parse(value) as Workout[];
      if (!Array.isArray(workouts)) return [];

      return workouts
        .filter((workout) => workout && typeof workout.id === 'number')
        .map((workout) => ({
          ...workout,
          date: new Date(workout.date),
          exercises: Array.isArray(workout.exercises) ? workout.exercises : [],
          sets: Array.isArray(workout.sets) ? workout.sets : [],
        }));
    } catch {
      return [];
    }
  }
}
