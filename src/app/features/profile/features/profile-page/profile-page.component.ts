import { Component, inject } from '@angular/core';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { ProfilePreferencesService } from '../../../../core/profile/profile-preferences.service';
import { AppLanguage, AppTheme } from '../../../../core/profile/user-profile.models';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  readonly profilePreferences = inject(ProfilePreferencesService);
  readonly i18n = inject(I18nService);

  readonly profile = this.profilePreferences.profile;

  updateName(name: string) {
    this.profilePreferences.updateProfile({ name });
  }

  updateBirthday(birthday: string) {
    this.profilePreferences.updateProfile({ birthday });
  }

  updateTall(tall: string) {
    this.profilePreferences.updateProfile({ tall: this.toOptionalNumber(tall) });
  }

  updateWeight(weight: string) {
    this.profilePreferences.updateProfile({ weight: this.toOptionalNumber(weight) });
  }

  updateTheme(theme: string) {
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      this.profilePreferences.updateProfile({ theme });
    }
  }

  updateLanguage(language: string) {
    if (language === 'en' || language === 'fa') {
      this.profilePreferences.updateProfile({ language });
    }
  }

  uploadProfileImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageBase64 = typeof reader.result === 'string' ? reader.result : null;
      this.profilePreferences.updateProfile({ imageBase64 });
    };

    reader.readAsDataURL(file);
  }

  getThemeLabel(theme: AppTheme): string {
    switch (theme) {
      case 'light':
        return this.i18n.t('themeLight');
      case 'dark':
        return this.i18n.t('themeDark');
      case 'system':
        return this.i18n.t('themeSystem');
    }
  }

  getLanguageLabel(language: AppLanguage): string {
    return language === 'fa' ? 'فارسی' : 'English';
  }

  private toOptionalNumber(value: string): number | null {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return null;
    }

    const numberValue = Number(normalizedValue);

    return Number.isFinite(numberValue) ? numberValue : null;
  }
}

