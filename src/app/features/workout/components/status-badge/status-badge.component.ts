import { Component, input } from '@angular/core';
import { StatusBadgeConfig } from '../../data-access/models/status-badge-config.interface';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  readonly config = input.required<StatusBadgeConfig>();
}
