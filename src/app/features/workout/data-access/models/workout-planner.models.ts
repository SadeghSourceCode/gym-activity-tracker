export type DayPlanType = 'workout' | 'rest' | 'empty';

export type WorkoutCompletionStatus = 'pending' | 'completed' | 'rejected';

export type WorkoutDisplayStatus = 'in-progress' | 'done' | 'rejected' | 'upcoming';

export interface WorkoutSummary {
  id: string;
  title: string;
  scheduledDate: string;
  exerciseCount: number;
  completionStatus: WorkoutCompletionStatus;
  estimatedMinutes: number;
  exercises: WorkoutExercisePreview[];
  progressPercent: number;
  sessionActive: boolean;
}

export interface WorkoutExercisePreview {
  id: string;
  name: string;
  setCount: number;
  weight: number;
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
  estimatedMinutes: number;
  exercises: WorkoutExercisePreview[];
  status: WorkoutDisplayStatus;
  progressPercent: number;
  sessionActive: boolean;
}

export interface SelectedDayViewModel {
  date: string;
  type: DayPlanType;
  workouts: WorkoutCardViewModel[];
  canAddWorkout: boolean;
  canManageWorkouts: boolean;
  canMarkAsRestDay: boolean;
}
