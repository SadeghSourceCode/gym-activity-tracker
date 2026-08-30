import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { Component, input, output } from '@angular/core';
import { WorkoutPlanningChangedOutput } from '../../data-access/models/workout-planning-changed-output.interface';
import {
  WorkoutPlanningExerciseConfig,
  WorkoutPlanningStepConfig,
} from '../../data-access/models/workout-planning-step-config.interface';

@Component({
  selector: 'app-workout-planning-step',
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDragHandle],
  templateUrl: './workout-planning-step.component.html',
})
export class WorkoutPlanningStepComponent {
  readonly config = input.required<WorkoutPlanningStepConfig>();
  readonly planningChanged = output<WorkoutPlanningChangedOutput>();
  readonly exerciseRemoved = output<string>();
  readonly exerciseReordered = output<{ exerciseId: string; targetExerciseId: string }>();
  readonly setCountChanged = output<{ exerciseId: string; setCount: number }>();

  onWorkoutTitleChanged(event: Event) {
    this.planningChanged.emit({ workoutTitle: (event.target as HTMLInputElement).value });
  }

  onRecurrenceChanged(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.planningChanged.emit({
      recurrenceFrequency: value === 'weekly' || value === 'monthly' ? value : null,
    });
  }

  onExerciseDropped(event: CdkDragDrop<readonly WorkoutPlanningExerciseConfig[]>) {
    const exerciseId = event.item.data as string;
    const targetExerciseId = event.container.data[event.currentIndex]?.id;

    if (targetExerciseId && exerciseId !== targetExerciseId) {
      this.exerciseReordered.emit({ exerciseId, targetExerciseId });
    }
  }
}
