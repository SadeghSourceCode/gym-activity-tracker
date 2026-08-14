export type WorkoutOverviewIcon = 'calories' | 'time' | 'exercises';

export interface WorkoutOverviewItemConfig {
  label: string;
  value: string;
  icon: WorkoutOverviewIcon;
}

export interface WorkoutOverviewConfig {
  title: string;
  items: readonly WorkoutOverviewItemConfig[];
}
