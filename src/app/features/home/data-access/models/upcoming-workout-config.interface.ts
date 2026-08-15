export interface UpcomingWorkoutItemConfig {
  id: string;
  title: string;
  scheduleLabel: string;
  locationLabel?: string;
  categoryLabel?: string;
}

export interface UpcomingWorkoutConfig {
  title: string;
  emptyLabel: string;
  addWorkoutLabel: string;
  workouts?: readonly UpcomingWorkoutItemConfig[];
}
