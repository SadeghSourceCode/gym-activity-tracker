import { Routes } from "@angular/router";
import { MainComponent } from "./features";

export const WorkoutRoutes: Routes = [
  {
    path: '',
    loadComponent: () => MainComponent
  }
]
