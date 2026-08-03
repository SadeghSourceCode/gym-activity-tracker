import {
  DailyWorkoutPlan,
  SelectedDayViewModel,
} from '../models/workout-planner.models';
import { resolveWorkoutStatus } from './workout-status.util';

export function mapDailyPlanToViewModel(
  plan: DailyWorkoutPlan,
  today: string,
): SelectedDayViewModel {
  return {
    date: plan.date,
    type: plan.type,
    workouts: plan.workouts.map((workout) => ({
      id: workout.id,
      title: workout.title,
      exerciseCount: workout.exerciseCount,
      status: resolveWorkoutStatus(
        workout.scheduledDate,
        workout.completionStatus,
        today,
      ),
    })),
    canAddWorkout: plan.type === 'empty',
    canMarkAsRestDay: plan.type === 'empty',
  };
}

