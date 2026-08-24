import { Component, computed, input, output } from '@angular/core';
import { AppButtonConfig } from '../../data-access/models/app-button-config.interface';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './app-button.html',
  styleUrl: './app-button.scss',
})
export class AppButton {
  readonly config = input<AppButtonConfig | undefined>();
  readonly hostClasses = input('', { alias: 'class' });

  readonly buttonClicked = output<MouseEvent>();

  readonly isInteractionDisabled = computed(
    () => (this.config()?.disabled ?? false) || (this.config()?.loading ?? false),
  );

  readonly classes = computed(() =>
    [
      'app-button',
      `app-button--${this.config()?.size ?? 'medium'}`,
      `app-button--${this.config()?.variant ?? 'fill'}`,
      `app-button--${this.config()?.mode ?? 'section'}`,
      this.config()?.active ? 'app-button--active' : '',
      this.config()?.loading ? 'app-button--loading' : '',
      this.hostClasses(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  onClick(event: MouseEvent) {
    if (this.isInteractionDisabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.buttonClicked.emit(event);
  }
}
