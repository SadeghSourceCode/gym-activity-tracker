import { Component, input, output, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { WorkoutCalendarComponent } from '../workout-calendar/workout-calendar.component';
import { ExerciseSelectionStepConfig } from '../../data-access/models/exercise-selection-step-config.interface';

@Component({
  selector: 'app-exercise-selection-step',
  standalone: true,
  imports: [NgClass, WorkoutCalendarComponent],
  templateUrl: './exercise-selection-step.component.html',
})
export class ExerciseSelectionStepComponent {
  readonly config = input.required<ExerciseSelectionStepConfig>();
  readonly dateSelected = output<string>();
  readonly queryChanged = output<string>();
  readonly muscleToggled = output<string>();
  readonly exerciseToggled = output<string>();
  readonly loadMoreRequested = output<void>();

  readonly showCalendar = signal(false);
  readonly showSearch = signal(false);

  toggleCalendar(): void {
    this.showCalendar.update((visible) => !visible);
  }

  toggleSearch(): void {
    this.showSearch.update((visible) => !visible);
    if (!this.showSearch() && this.config().searchQuery) this.queryChanged.emit('');
  }

  showAllExercises(): void {
    this.queryChanged.emit('');
    const selectedMuscle = this.config().muscles.find((muscle) => muscle.selected);
    if (selectedMuscle) this.muscleToggled.emit(selectedMuscle.id);
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.scrollHeight - target.scrollTop - target.clientHeight < 240) {
      this.loadMoreRequested.emit();
    }
  }
}
