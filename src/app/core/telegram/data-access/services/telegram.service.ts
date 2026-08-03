import { computed, Injectable, signal } from "@angular/core";
import { TelegramWebApp, TelegramWebAppUser } from "../models/telegram.types";

@Injectable({
  providedIn:'root'
})
export class TelegramService {

  private readonly webApp: TelegramWebApp | undefined = window.Telegram?.WebApp ?? undefined;
  readonly isAvailable = signal(this.webApp !== undefined);
  readonly user = signal<TelegramWebAppUser | undefined>(this.webApp?.initDataUnsafe.user ?? undefined);

  readonly platform = signal(this.webApp?.platform ?? undefined)
  readonly colorScheme = signal<'light' | 'dark'>(this.webApp?.colorScheme ?? 'light');
  readonly isInsideTelegram = computed(() => this.isAvailable() && this.webApp?.initData !== undefined)

  initialize(): void {
    if (!this.webApp) {
      console.warn("TELEGRAM MINI APP SDK NOT AVAILABLE");
      return;
    }

    this.webApp.ready();
    this.webApp.expand();

    console.log('Telegram mini app initialized', {
      platform: this.webApp.platform,
      version: this.webApp.version,
      user: this.webApp.initDataUnsafe.user ?? undefined
    });
  }

  getInitialData(): string {
    return this.webApp?.initData ?? ''
  }

  close(): void {
    this.webApp?.close();
  }

}
