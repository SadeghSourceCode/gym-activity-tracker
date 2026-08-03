export type AppLanguage = 'en' | 'fa';

export type AppTheme = 'light' | 'dark' | 'system';

export interface UserProfile {
  imageBase64: string | null;
  name: string;
  birthday: string;
  tall: number | null;
  weight: number | null;
  theme: AppTheme;
  language: AppLanguage;
}

