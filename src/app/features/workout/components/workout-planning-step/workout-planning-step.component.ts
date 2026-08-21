import { Component, input, output } from '@angular/core';
import { WorkoutPlanningChangedOutput } from '../../data-access/models/workout-planning-changed-output.interface';
import { WorkoutPlanningStepConfig } from '../../data-access/models/workout-planning-step-config.interface';

@Component({
  selector: 'app-workout-planning-step',
  standalone: true,
  templateUrl: './workout-planning-step.component.html',
})
export class WorkoutPlanningStepComponent {
  readonly config = input.required<WorkoutPlanningStepConfig>();
  readonly planningChanged = output<WorkoutPlanningChangedOutput>();

  onWorkoutTitleChanged(event: Event) {
    this.planningChanged.emit({ workoutTitle: (event.target as HTMLInputElement).value });
  }

  onWeeklyPlanChanged(event: Event) {
    this.planningChanged.emit({ isWeeklyPlan: (event.target as HTMLInputElement).checked });
  }
}
