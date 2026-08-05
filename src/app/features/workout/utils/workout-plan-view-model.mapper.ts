import {
  DailyWorkoutPlan,
  SelectedDayViewModel,
} from '../models/workout-planner.models';
import { resolveWorkoutStatus } from './workout-status.util';

export function mapDailyPlanToViewModel(
  plan: DailyWorkoutPlan,
  today: string,
): SelectedDayViewModel {
  const canManageSelectedDay = plan.date >= today;

  return {
    date: plan.date,
    type: plan.type,
    workouts: plan.workouts.map((workout) => ({
      id: workout.id,
      title: workout.title,
      exerciseCount: workout.exerciseCount,
      estimatedMinutes: workout.estimatedMinutes,
      exercises: workout.exercises,
      status: resolveWorkoutStatus(
        workout.scheduledDate,
        workout.completionStatus,
        today,
      ),
    })),
    canAddWorkout: plan.type === 'empty' && canManageSelectedDay,
    canManageWorkouts: canManageSelectedDay,
    canMarkAsRestDay: plan.type === 'empty' && canManageSelectedDay,
  };
}
