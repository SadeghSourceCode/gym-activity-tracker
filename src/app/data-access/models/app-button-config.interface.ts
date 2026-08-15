import { AppButtonMode, AppButtonSize, AppButtonType, AppButtonVariant } from './app-button.type';

export interface AppButtonConfig {
  size?: AppButtonSize;
  variant?: AppButtonVariant;
  mode?: AppButtonMode;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  type?: AppButtonType;
  ariaLabel?: string | null;
  ariaCurrent?: string | null;
}
