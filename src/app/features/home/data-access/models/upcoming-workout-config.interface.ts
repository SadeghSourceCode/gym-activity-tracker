export interface UpcomingWorkoutExerciseConfig {
  id: string;
  name: string;
  setCount: number;
  weightKg?: number;
}

export interface UpcomingWorkoutItemConfig {
  id: string;
  title: string;
  scheduleLabel: string;
  locationLabel?: string;
  categoryLabel?: string;
  exercises: readonly UpcomingWorkoutExerciseConfig[];
}

export interface UpcomingWorkoutConfig {
  title: string;
  emptyLabel: string;
  addWorkoutLabel: string;
  workouts?: readonly UpcomingWorkoutItemConfig[];
}
