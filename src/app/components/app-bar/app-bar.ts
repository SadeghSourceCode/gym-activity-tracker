import { Component, input, output } from '@angular/core';
import { AppButton } from '../app-button/app-button';

@Component({
  selector: 'app-bar',
  imports: [AppButton],
  templateUrl: './app-bar.html',
  styleUrl: './app-bar.scss',
})
export class AppBar {

  config = input.required<{
    rightIcon: string;
    title: string;
    leftIcon: string;
  }>();

  onRightIconClicked = output()
  onLeftIconClicked = output()
}
