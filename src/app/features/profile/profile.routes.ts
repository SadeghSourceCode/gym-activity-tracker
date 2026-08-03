import { Routes } from '@angular/router';

export const ProfileRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/profile-page/profile-page.component').then(
        (component) => component.ProfilePageComponent,
      ),
  },
];

