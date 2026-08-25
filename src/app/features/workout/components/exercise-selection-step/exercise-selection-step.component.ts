import { Component, input, output } from '@angular/core';
import { WorkoutCalendarComponent } from '../workout-calendar/workout-calendar.component';
import { ExerciseSelectionStepConfig } from '../../data-access/models/exercise-selection-step-config.interface';

@Component({
  selector: 'app-exercise-selection-step',
  standalone: true,
  imports: [WorkoutCalendarComponent],
  templateUrl: './exercise-selection-step.component.html',
})
export class ExerciseSelectionStepComponent {
  readonly config = input.required<ExerciseSelectionStepConfig>();
  readonly dateSelected = output<string>();
  readonly queryChanged = output<string>();
  readonly muscleToggled = output<string>();
  readonly exerciseToggled = output<string>();
  readonly loadMoreRequested = output<void>();

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 240) {
      this.loadMoreRequested.emit();
    }
  }
}
