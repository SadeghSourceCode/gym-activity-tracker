export type DayPlanType = 'workout' | 'rest' | 'empty';

export type WorkoutCompletionStatus = 'pending' | 'completed' | 'rejected';

export type WorkoutDisplayStatus = 'in-progress' | 'done' | 'rejected' | 'upcoming';

export interface WorkoutSummary {
  id: string;
  title: string;
  scheduledDate: string;
  exerciseCount: number;
  completionStatus: WorkoutCompletionStatus;
}

export interface DailyWorkoutPlan {
  date: string;
  type: DayPlanType;
  workouts: WorkoutSummary[];
}

export interface WorkoutCardViewModel {
  id: string;
  title: string;
  exerciseCount: number;
  status: WorkoutDisplayStatus;
}

export interface SelectedDayViewModel {
  date: string;
  type: DayPlanType;
  workouts: WorkoutCardViewModel[];
  canAddWorkout: boolean;
  canMarkAsRestDay: boolean;
}

