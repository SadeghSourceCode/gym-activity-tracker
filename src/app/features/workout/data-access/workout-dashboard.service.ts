import { Injectable } from '@angular/core';
import { Workout } from '../models/workout-storage.models';
import { getDateKey, parseDateKey } from '../utils/calendar-date.util';
import { isWorkoutOnDate } from '../utils/weekly-recurrence.util';
import {
  WorkoutDashboardDaySummary,
  WorkoutDashboardSummary,
} from './models/workout-dashboard-summary.interface';

@Injectable({ providedIn: 'root' })
export class WorkoutDashboardService {
  private readonly estimatedMinutesPerExercise = 12;
  private readonly estimatedCaloriesPerMinute = 6;

  createSummary(workouts: readonly Workout[], selectedDateKey: string): WorkoutDashboardSummary {
    const selectedDate = parseDateKey(selectedDateKey);
    const weekStart = this.getWeekStart(selectedDate);
    const weeklyCalories = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return this.createDaySummary(workouts, getDateKey(date));
    });
    const selectedDayWorkouts = this.getWorkoutsForDate(workouts, selectedDateKey);
    const selectedDayExerciseCount = selectedDayWorkouts.reduce(
      (total, workout) => total + workout.exercises.length,
      0,
    );
    const selectedDayDurationMinutes = selectedDayExerciseCount * this.estimatedMinutesPerExercise;

    return {
      weeklyCalories,
      selectedDayCalories: this.estimateCalories(selectedDayDurationMinutes),
      selectedDayDurationMinutes,
      selectedDayExerciseCount,
    };
  }

  private createDaySummary(
    workouts: readonly Workout[],
    dateKey: string,
  ): WorkoutDashboardDaySummary {
    const exerciseCount = this.getWorkoutsForDate(workouts, dateKey).reduce(
      (total, workout) => total + workout.exercises.length,
      0,
    );
    const durationMinutes = exerciseCount * this.estimatedMinutesPerExercise;

    return { dateKey, calories: this.estimateCalories(durationMinutes) };
  }

  private getWorkoutsForDate(workouts: readonly Workout[], dateKey: string): Workout[] {
    return workouts.filter((workout) => isWorkoutOnDate(workout, dateKey));
  }

  private estimateCalories(durationMinutes: number): number {
    return durationMinutes * this.estimatedCaloriesPerMinute;
  }

  private getWeekStart(date: Date): Date {
    const weekStart = new Date(date);
    weekStart.setHours(0, 0, 0, 0);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() + (day === 0 ? -6 : 1 - day));

    return weekStart;
  }
}
