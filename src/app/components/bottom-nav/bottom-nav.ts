import { Component, input, output } from '@angular/core';
import { BottomNavConfig } from '../../data-access/models/bottom-nav-config.interface';
import { BottomNavItemId } from '../../data-access/models/bottom-nav-item-id.type';
import { BottomNavItemSelectedOutput } from '../../data-access/models/bottom-nav-item-selected-output.interface';
import { AppButton } from '../app-button/app-button';

@Component({
  selector: 'app-bottom-nav',
  imports: [AppButton],
  templateUrl: './bottom-nav.html',
})
export class BottomNav {
  readonly config = input.required<BottomNavConfig>();
  readonly itemSelected = output<BottomNavItemSelectedOutput>();

  protected isSelected(itemId: BottomNavItemId): boolean {
    return this.config().selectedItemId === itemId;
  }
}
