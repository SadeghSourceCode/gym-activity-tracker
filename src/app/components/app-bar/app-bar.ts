import { Component, input, output } from '@angular/core';
import { AppButton } from '../app-button/app-button';
import { AppBarConfig } from '../../data-access/models/app-bar-config.interface';

@Component({
  selector: 'app-bar',
  imports: [AppButton],
  templateUrl: './app-bar.html',
  styleUrl: './app-bar.scss',
})
export class AppBar {
  readonly config = input.required<AppBarConfig>();

  readonly rightIconClicked = output<void>();
  readonly leftIconClicked = output<void>();
}
