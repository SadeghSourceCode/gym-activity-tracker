import { Routes } from "@angular/router";
import { WorkoutPage } from "./features";

export const WorkoutRoutes: Routes = [
  {
    path: '',
    loadComponent: () => WorkoutPage
  }
]
