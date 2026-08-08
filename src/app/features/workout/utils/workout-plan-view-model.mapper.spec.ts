import { DailyWorkoutPlan } from '../models/workout-planner.models';
import { mapDailyPlanToViewModel } from './workout-plan-view-model.mapper';

describe('mapDailyPlanToViewModel', () => {
  const today = '2026-08-03';

  it('maps a workout day with multiple workouts', () => {
    const plan: DailyWorkoutPlan = {
      date: today,
      type: 'workout',
      workouts: [
        {
          id: '1',
          title: 'Upper Body',
          scheduledDate: today,
          exerciseCount: 6,
          estimatedMinutes: 15,
          exercises: [],
          completionStatus: 'pending',
        },
        {
          id: '2',
          title: 'Core',
          scheduledDate: today,
          exerciseCount: 0,
          estimatedMinutes: 15,
          exercises: [],
          completionStatus: 'completed',
        },
      ],
    };

    expect(mapDailyPlanToViewModel(plan, today)).toEqual({
      date: today,
      type: 'workout',
      workouts: [
        {
          id: '1',
          title: 'Upper Body',
          exerciseCount: 6,
          estimatedMinutes: 15,
          exercises: [],
          status: 'in-progress',
        },
        {
          id: '2',
          title: 'Core',
          exerciseCount: 0,
          estimatedMinutes: 15,
          exercises: [],
          status: 'done',
        },
      ],
      canAddWorkout: false,
      canManageWorkouts: true,
      canMarkAsRestDay: false,
    });
  });

  it('maps an empty day', () => {
    expect(
      mapDailyPlanToViewModel(
        {
          date: '2026-08-04',
          type: 'empty',
          workouts: [],
        },
        today,
      ),
    ).toEqual({
      date: '2026-08-04',
      type: 'empty',
      workouts: [],
      canAddWorkout: true,
      canManageWorkouts: true,
      canMarkAsRestDay: true,
    });
  });

  it('maps a rest day', () => {
    expect(
      mapDailyPlanToViewModel(
        {
          date: '2026-08-05',
          type: 'rest',
          workouts: [],
        },
        today,
      ),
    ).toEqual({
      date: '2026-08-05',
      type: 'rest',
      workouts: [],
      canAddWorkout: false,
      canManageWorkouts: true,
      canMarkAsRestDay: false,
    });
  });
});

