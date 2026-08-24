import { Component, computed, input, output } from '@angular/core';
import { AppButtonConfig } from '../../data-access/models/app-button-config.interface';
import { AppHeaderConfig } from '../../data-access/models/app-header-config.interface';
import { AppButton } from '../app-button/app-button';

@Component({
  selector: 'app-header',
  imports: [AppButton],
  templateUrl: './app-header.html',
})
export class AppHeader {
  readonly config = input.required<AppHeaderConfig>();

  readonly leftButton = computed(() => this.getRenderableButton(this.config().leftButton));
  readonly rightButton = computed(() => this.getRenderableButton(this.config().rightButton));

  readonly rightButtonClicked = output<MouseEvent>();
  readonly leftButtonClicked = output<MouseEvent>();

  private getRenderableButton(button: AppButtonConfig | undefined): AppButtonConfig | undefined {
    if (!button) {
      return undefined;
    }

    const mode = button.mode ?? 'section';
    const hasContent =
      mode === 'iconOnly' ? Boolean(button.icon?.trim()) : Boolean(button.title?.trim());

    return hasContent ? button : undefined;
  }
}
