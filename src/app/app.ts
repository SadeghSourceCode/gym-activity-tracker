import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from './core/i18n/i18n.service';

type BottomNavItem = 'home' | 'search' | 'progress' | 'profile';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  protected readonly title = signal('gym-activity-tracker');
  protected readonly selectedBottomNavItem = signal<BottomNavItem | null>(null);

  protected readonly bottomNavItems: { id: BottomNavItem; labelKey: 'home' | 'search' | 'progress' | 'profile'; route: string }[] = [
    { id: 'home', labelKey: 'home', route: '/' },
    { id: 'search', labelKey: 'search', route: '/search' },
    { id: 'progress', labelKey: 'progress', route: '/' },
    { id: 'profile', labelKey: 'profile', route: '/profile' },
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

  protected getBottomNavLabel(labelKey: 'home' | 'search' | 'progress' | 'profile'): string {
    return this.i18n.t(labelKey);
  }

  private syncSelectedBottomNavItemWithRoute(url: string) {
    const path = url.split('?')[0].split('#')[0];
    const matchingItem = this.bottomNavItems.find((item) =>
      item.route === '/' ? path === '/' : path.startsWith(item.route),
    );

    this.selectedBottomNavItem.set(matchingItem?.id ?? null);
  }
}
