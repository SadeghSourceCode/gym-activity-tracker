import { Component, computed, input } from '@angular/core';
import { NearbyGymsConfig } from '../../data-access/models/nearby-gyms-config.interface';

@Component({
  selector: 'app-nearby-gyms',
  templateUrl: './nearby-gyms.component.html',
})
export class NearbyGymsComponent {
  readonly config = input.required<NearbyGymsConfig>();
  readonly gyms = computed(() => this.config().gyms ?? []);
}
