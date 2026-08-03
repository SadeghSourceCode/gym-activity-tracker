import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.routes').then((r) => r.SearchRoutes),
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then((r) => r.ProfileRoutes),
  },
  {
    path: '',
    loadChildren: () => import('./features/workout/workout.routes').then((r) => r.WorkoutRoutes),
  },
];
