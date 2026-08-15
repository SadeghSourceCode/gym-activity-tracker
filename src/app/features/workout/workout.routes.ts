import { Routes } from '@angular/router';
import { WorkoutPage } from './features';

export const WorkoutRoutes: Routes = [
  {
    path: 'add-workout',
    loadComponent: () =>
      import('./features/add-workout/add-workout.component').then((c) => c.AddWorkoutComponent),
  },
  {
    path: 'workout-detail/:id',
    loadComponent: () =>
      import('./features/workout-detail/workout-detail-page').then((c) => c.WorkoutDetailPage),
  },
  {
    path: '',
    loadComponent: () => WorkoutPage,
  },
];
