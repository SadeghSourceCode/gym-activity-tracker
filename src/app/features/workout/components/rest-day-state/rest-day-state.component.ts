import { Component, input, output } from '@angular/core';
import { AppButton } from '../../../../components/app-button/app-button';
import { RestDayStateConfig } from '../../data-access/models/rest-day-state-config.interface';

@Component({
  selector: 'app-rest-day-state',
  standalone: true,
  imports: [AppButton],
  templateUrl: './rest-day-state.component.html',
})
export class RestDayStateComponent {
  readonly config = input.required<RestDayStateConfig>();

  readonly remove = output<void>();
}
