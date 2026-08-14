import { Component, input, output } from '@angular/core';
import { AppHeaderConfig } from '../../data-access/models/app-header-config.interface';
import { AppButton } from '../app-button/app-button';

@Component({
  selector: 'app-header',
  imports: [AppButton],
  templateUrl: './app-header.html',
})
export class AppHeader {
  readonly config = input.required<AppHeaderConfig>();

  readonly rightButtonClicked = output<MouseEvent>();
  readonly leftButtonClicked = output<MouseEvent>();
}
