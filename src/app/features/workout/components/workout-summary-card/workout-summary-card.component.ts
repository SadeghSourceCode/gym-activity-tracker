import { Component, HostListener, input, output, signal } from '@angular/core';
import { WorkoutCardViewModel } from '../../models/workout-planner.models';
import { AppButton } from '../../../../components/app-button/app-button';

@Component({
  selector: 'app-workout-summary-card',
  standalone: true,
  imports: [AppButton],
  templateUrl: './workout-summary-card.component.html',
})
export class WorkoutSummaryCardComponent {
  readonly workout = input.required<WorkoutCardViewModel>();
  readonly exerciseCountLabel = input.required<string>();
  readonly openLabel = input.required<string>();
  readonly rejectLabel = input.required<string>();
  readonly editLabel = input.required<string>();
  readonly deleteLabel = input.required<string>();
  readonly copyLabel = input.required<string>();
  readonly copiedLabel = input.required<string>();
  readonly canManage = input.required<boolean>();

  readonly open = output<string>();
  readonly reject = output<string>();
  readonly edit = output<string>();
  readonly deleteWorkout = output<string>();
  readonly copy = output<string>();

  readonly visibleExerciseLimit = 3;

  readonly isCopied = signal(false);
  readonly isActionsMenuOpen = signal(false);

  visibleExercises() {
    return this.workout().exercises.slice(0, this.visibleExerciseLimit);
  }

  hiddenExerciseCount(): number {
    return Math.max(this.workout().exerciseCount - this.visibleExerciseLimit, 0);
  }

  getEstimatedDurationLabel(): string {
    return `est. ${this.workout().estimatedMinutes} min`;
  }

  toggleActionsMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isActionsMenuOpen.update((isOpen) => !isOpen);
  }

  onCopy() {
    this.copy.emit(this.workout().id);
    this.isActionsMenuOpen.set(false);
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 2000);
  }

  onOpen() {
    this.isActionsMenuOpen.set(false);
    this.open.emit(this.workout().id);
  }

  onEdit() {
    this.isActionsMenuOpen.set(false);
    this.edit.emit(this.workout().id);
  }

  onDelete() {
    this.isActionsMenuOpen.set(false);
    this.deleteWorkout.emit(this.workout().id);
  }

  @HostListener('document:click')
  closeActionsMenu() {
    this.isActionsMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeActionsMenuFromKeyboard() {
    this.isActionsMenuOpen.set(false);
  }
}
