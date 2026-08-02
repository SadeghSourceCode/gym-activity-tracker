import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

type BottomNavItem = 'home' | 'search' | 'progress' | 'profile';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);

  protected readonly title = signal('gym-activity-tracker');
  protected readonly selectedBottomNavItem = signal<BottomNavItem | null>(null);

  protected readonly bottomNavItems: { id: BottomNavItem; label: string; route: string }[] = [
    { id: 'home', label: 'Home', route: '/' },
    { id: 'search', label: 'Search', route: '/search' },
    { id: 'progress', label: 'Progress', route: '/' },
    { id: 'profile', label: 'Profile', route: '/' },
  ];

  constructor() {
    this.syncSelectedBottomNavItemWithRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.syncSelectedBottomNavItemWithRoute(event.urlAfterRedirects));
  }

  protected selectBottomNavItem(item: BottomNavItem, route: string) {
    void this.router.navigateByUrl(route);
  }

  protected isBottomNavItemSelected(item: BottomNavItem): boolean {
    return this.selectedBottomNavItem() === item;
  }

  private syncSelectedBottomNavItemWithRoute(url: string) {
    const path = url.split('?')[0].split('#')[0];
    const matchingItem = this.bottomNavItems.find((item) =>
      item.route === '/' ? path === '/' : path.startsWith(item.route),
    );

    this.selectedBottomNavItem.set(matchingItem?.id ?? null);
  }
}
