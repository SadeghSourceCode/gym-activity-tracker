import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from './core/i18n/i18n.service';
import { BottomNav } from './components/bottom-nav/bottom-nav';
import { BottomNavItemId } from './data-access/models/bottom-nav-item-id.type';
import { BottomNavItemSelectedOutput } from './data-access/models/bottom-nav-item-selected-output.interface';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BottomNav],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  readonly i18n = inject(I18nService);

  protected readonly title = signal('gym-activity-tracker');
  protected readonly selectedBottomNavItem = signal<BottomNavItemId | null>(null);

  protected readonly bottomNavItems: {
    id: BottomNavItemId;
    labelKey: 'home' | 'search' | 'statistics' | 'profile';
    route: string;
    iconClass: string;
  }[] = [
    { id: 'home', labelKey: 'home', route: '/', iconClass: 'fa-house' },
    { id: 'search', labelKey: 'search', route: '/search', iconClass: 'fa-magnifying-glass' },
    {
      id: 'statistics',
      labelKey: 'statistics',
      route: '/statistics',
      iconClass: 'fa-chart-column',
    },
    { id: 'profile', labelKey: 'profile', route: '/profile', iconClass: 'fa-user' },
  ];

  protected readonly bottomNavConfig = computed(() => ({
    items: this.bottomNavItems.map((item) => ({
      id: item.id,
      route: item.route,
      iconClass: item.iconClass,
      label: this.i18n.t(item.labelKey),
    })),
    selectedItemId: this.selectedBottomNavItem()!,
  }));

  constructor() {
    this.syncSelectedBottomNavItemWithRoute(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.syncSelectedBottomNavItemWithRoute(event.urlAfterRedirects));
  }

  protected selectBottomNavItem(selection: BottomNavItemSelectedOutput): void {
    void this.router.navigateByUrl(selection.route);
  }

  private syncSelectedBottomNavItemWithRoute(url: string) {
    const path = url.split('?')[0].split('#')[0];
    const matchingItem = this.bottomNavItems.find((item) => item.route === path);

    this.selectedBottomNavItem.set(matchingItem?.id ?? null);
  }
}
