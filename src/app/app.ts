import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

type BottomNavItem = 'home' | 'search' | 'progress' | 'profile';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('gym-activity-tracker');
  protected readonly selectedBottomNavItem = signal<BottomNavItem>('home');

  protected readonly bottomNavItems: { id: BottomNavItem; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'search', label: 'Search' },
    { id: 'progress', label: 'Progress' },
    { id: 'profile', label: 'Profile' },
  ];

  protected selectBottomNavItem(item: BottomNavItem) {
    this.selectedBottomNavItem.set(item);
  }

  protected isBottomNavItemSelected(item: BottomNavItem): boolean {
    return this.selectedBottomNavItem() === item;
  }
}
