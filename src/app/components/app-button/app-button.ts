import { Component, computed, input, output } from '@angular/core';

export type AppButtonSize = 'small' | 'medium' | 'large';
export type AppButtonVariant = 'fill' | 'outline' | 'link';
export type AppButtonMode = 'section' | 'form' | 'iconOnly';
export type AppButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './app-button.html',
  styleUrl: './app-button.scss',
})
export class AppButton {
  readonly size = input<AppButtonSize>('medium');
  readonly variant = input<AppButtonVariant>('fill');
  readonly mode = input<AppButtonMode>('section');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly active = input(false);
  readonly type = input<AppButtonType>('button');
  readonly ariaLabel = input<string | null>(null);
  readonly ariaCurrent = input<string | null>(null);
  readonly customClass = input('');

  readonly buttonClicked = output<MouseEvent>();

  readonly isInteractionDisabled = computed(() => this.disabled() || this.loading());

  readonly classes = computed(() =>
    [
      'app-button',
      `app-button--${this.size()}`,
      `app-button--${this.variant()}`,
      `app-button--${this.mode()}`,
      this.active() ? 'app-button--active' : '',
      this.loading() ? 'app-button--loading' : '',
      this.customClass(),
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
