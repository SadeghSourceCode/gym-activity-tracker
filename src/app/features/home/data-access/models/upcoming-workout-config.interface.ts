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
  workouts?: readonly UpcomingWorkoutItemConfig[];
}
