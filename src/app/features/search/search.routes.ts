import { Routes } from '@angular/router';

export const SearchRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/search-page/search-page.component').then((m) => m.SearchPageComponent),
  },
];
