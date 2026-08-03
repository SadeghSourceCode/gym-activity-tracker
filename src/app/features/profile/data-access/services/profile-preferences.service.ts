import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { AppLanguage, AppTheme, UserProfile } from '../models/user-profile.models';

const defaultProfile: UserProfile = {
  imageBase64: null,
  name: '',
  birthday: '',
  tall: null,
  weight: null,
  theme: 'system',
  language: 'en',
};

@Injectable({ providedIn: 'root' })
export class ProfilePreferencesService {
  private readonly storageKey = 'gym-activity-tracker.profile';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly document = inject(DOCUMENT);

  readonly profile = signal<UserProfile>(this.loadProfile());
  readonly language = computed(() => this.profile().language);
  readonly theme = computed(() => this.profile().theme);

  constructor() {
    effect(() => {
      const profile = this.profile();

      this.persistProfile(profile);
      this.applyLanguage(profile.language);
      this.applyTheme(profile.theme);
    });
  }

  updateProfile(changes: Partial<UserProfile>) {
    this.profile.update((profile) => ({
      ...profile,
      ...changes,
    }));
  }

  private loadProfile(): UserProfile {
    if (!this.isBrowser) {
      return defaultProfile;
    }

    try {
      const storedProfile = localStorage.getItem(this.storageKey);

      if (!storedProfile) {
        return defaultProfile;
      }

      const profile = JSON.parse(storedProfile) as Partial<UserProfile>;

      return {
        imageBase64: typeof profile.imageBase64 === 'string' ? profile.imageBase64 : null,
        name: typeof profile.name === 'string' ? profile.name : '',
        birthday: typeof profile.birthday === 'string' ? profile.birthday : '',
        tall: typeof profile.tall === 'number' ? profile.tall : null,
        weight: typeof profile.weight === 'number' ? profile.weight : null,
        theme: this.normalizeTheme(profile.theme),
        language: this.normalizeLanguage(profile.language),
      };
    } catch {
      return defaultProfile;
    }
  }

  private persistProfile(profile: UserProfile) {
    if (!this.isBrowser) {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(profile));
    } catch {
      // Keep settings usable even when localStorage is unavailable/full.
    }
  }

  private applyLanguage(language: AppLanguage) {
    const html = this.document.documentElement;

    html.lang = language;
    html.dir = language === 'fa' ? 'rtl' : 'ltr';
  }

  private applyTheme(theme: AppTheme) {
    const html = this.document.documentElement;
    const prefersDark =
      this.isBrowser &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

    html.dataset['theme'] = resolvedTheme;
  }

  private normalizeTheme(theme: unknown): AppTheme {
    return theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system';
  }

  private normalizeLanguage(language: unknown): AppLanguage {
    return language === 'fa' || language === 'en' ? language : 'en';
  }
}
