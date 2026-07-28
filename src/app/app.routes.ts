import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: ()=> import('./features/workout/workout.routes').then(r => r.WorkoutRoutes)
  }
];
