export interface UpcomingWorkoutExerciseConfig {
  id: string;
  name: string;
}

export interface UpcomingWorkoutItemConfig {
  id: string;
  title: string;
  scheduleLabel: string;
  exercises: readonly UpcomingWorkoutExerciseConfig[];
}

export interface UpcomingWorkoutConfig {
  title: string;
  emptyLabel: string;
  workouts?: readonly UpcomingWorkoutItemConfig[];
}
