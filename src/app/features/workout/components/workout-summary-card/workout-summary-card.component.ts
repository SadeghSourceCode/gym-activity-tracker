import { Component, input, output, signal } from '@angular/core';
import { AppButton } from '../../../../components/app-button/app-button';
import { WorkoutSummaryCardConfig } from '../../data-access/models/workout-summary-card-config.interface';

@Component({
  selector: 'app-workout-summary-card',
  standalone: true,
  imports: [AppButton],
  templateUrl: './workout-summary-card.component.html',
})
export class WorkoutSummaryCardComponent {
  private readonly actionsMenuWidth = 144;
  readonly config = input.required<WorkoutSummaryCardConfig>();

  readonly open = output<string>();
  readonly edit = output<string>();
  readonly deleteWorkout = output<string>();
  readonly copy = output<string>();

  readonly visibleExerciseLimit = 3;

  readonly isCopied = signal(false);
  readonly actionsMenuAlignment = signal<'left' | 'right'>('right');

  visibleExercises() {
    return this.config().workout.exercises.slice(0, this.visibleExerciseLimit);
  }

  hiddenExerciseCount(): number {
    return Math.max(this.config().workout.exerciseCount - this.visibleExerciseLimit, 0);
  }

  getEstimatedDurationLabel(): string {
    const estimatedLabel = this.config().estimatedLabel ?? 'est.';
    const minutesLabel = this.config().minutesLabel ?? 'min';

    return `${estimatedLabel} ${this.config().workout.estimatedMinutes} ${minutesLabel}`;
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
    this.copy.emit(this.config().workout.id);
    this.isCopied.set(true);
    setTimeout(() => this.isCopied.set(false), 2000);
  }

  onOpen(actionsMenu: HTMLDetailsElement) {
    actionsMenu.removeAttribute('open');
    this.open.emit(this.config().workout.id);
  }

  onEdit(actionsMenu: HTMLDetailsElement) {
    actionsMenu.removeAttribute('open');
    this.edit.emit(this.config().workout.id);
  }

  onDelete(actionsMenu: HTMLDetailsElement) {
    actionsMenu.removeAttribute('open');
    this.deleteWorkout.emit(this.config().workout.id);
  }
}
