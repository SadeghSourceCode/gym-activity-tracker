import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-rest-day-state',
  standalone: true,
  templateUrl: './rest-day-state.component.html',
})
export class RestDayStateComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly removeLabel = input.required<string>();

  readonly remove = output<void>();
}

