export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  auth_date?: number;
  hash?: string;
  signature?: string;
  start_param?: string;
}

export interface TelegramWebApp {
  readonly initData: string;
  readonly initDataUnsafe: TelegramWebAppInitData;
  readonly version: string;
  readonly platform: string;
  readonly colorScheme: 'light' | 'dark';
  readonly isExpanded: boolean;

  ready(): void;
  expand(): void;
  close(): void;
}

export interface TelegramGlobal {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram?: TelegramGlobal;
  }
}

export {};
