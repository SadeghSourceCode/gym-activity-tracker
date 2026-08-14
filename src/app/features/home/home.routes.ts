import { Routes } from '@angular/router';

export const HomeRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home-page/home-page.component').then((c) => c.HomePageComponent),
  },
];
