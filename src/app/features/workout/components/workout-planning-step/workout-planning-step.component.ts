import { Component, input, output } from '@angular/core';
import { WorkoutPlanningStepConfig } from './workout-planning-step-config.interface';
import { WorkoutPlanningChangedOutput } from './workout-planning-step-output.interface';

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

  onSelectedDateChanged(event: Event) {
    this.planningChanged.emit({ selectedDate: (event.target as HTMLInputElement).value });
  }

  onWeeklyPlanChanged(event: Event) {
    this.planningChanged.emit({ isWeeklyPlan: (event.target as HTMLInputElement).checked });
  }
}
