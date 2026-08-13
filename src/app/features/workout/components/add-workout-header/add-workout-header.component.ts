import { Component, input, output } from '@angular/core';
import { AppButton } from '../../../../components/app-button/app-button';
import { AddWorkoutHeaderConfig } from './add-workout-header-config.interface';

@Component({
  selector: 'app-add-workout-header',
  standalone: true,
  imports: [AppButton],
  templateUrl: './add-workout-header.component.html',
})
export class AddWorkoutHeaderComponent {
  readonly config = input.required<AddWorkoutHeaderConfig>();
  readonly backRequested = output<void>();
  readonly nextRequested = output<void>();
}
