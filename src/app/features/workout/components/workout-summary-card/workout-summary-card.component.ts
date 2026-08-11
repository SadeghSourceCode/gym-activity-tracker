import { Component, input, output, signal } from '@angular/core';
import { WorkoutCardViewModel } from '../../models/workout-planner.models';
import { AppButton } from '../../../../components/app-button/app-button';

@Component({
  selector: 'app-workout-summary-card',
  standalone: true,
  imports: [AppButton],
  templateUrl: './workout-summary-card.component.html',
})
export class WorkoutSummaryCardComponent {
  private readonly actionsMenuWidth = 144;
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
  readonly actionsMenuAlignment = signal<'left' | 'right'>('right');

  visibleExercises() {
    return this.workout().exercises.slice(0, this.visibleExerciseLimit);
  }

  hiddenExerciseCount(): number {
    return Math.max(this.workout().exerciseCount - this.visibleExerciseLimit, 0);
  }

  getEstimatedDurationLabel(): string {
    return `est. ${this.workout().estimatedMinutes} min`;
  }

  onActionsMenuToggle(actionsMenu: HTMLDetailsElement) {
    if (!actionsMenu.open || typeof window === 'undefined') {
      return;
    }

    const trigger = actionsMenu.querySelector('summary');
    const menu = actionsMenu.querySelector<HTMLElement>('[role="menu"]');

    if (!trigger) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const menuWidth = Math.max(menu?.getBoundingClientRect().width ?? 0, this.actionsMenuWidth);
    const spaceToRight = window.innerWidth - triggerRect.left;
    const spaceToLeft = triggerRect.right;
    const opensToRight = spaceToRight >= menuWidth || spaceToRight >= spaceToLeft;

    this.actionsMenuAlignment.set(opensToRight ? 'left' : 'right');
  }

  onCopy(actionsMenu: HTMLDetailsElement) {
    actionsMenu.removeAttribute('open');
    this.copy.emit(this.workout().id);
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 2000);
  }

  onOpen(actionsMenu: HTMLDetailsElement) {
    actionsMenu.removeAttribute('open');
    this.open.emit(this.workout().id);
  }

  onEdit(actionsMenu: HTMLDetailsElement) {
    actionsMenu.removeAttribute('open');
    this.edit.emit(this.workout().id);
  }

  onDelete(actionsMenu: HTMLDetailsElement) {
    actionsMenu.removeAttribute('open');
    this.deleteWorkout.emit(this.workout().id);
  }
}
