export interface PeThemeInterface {
  primaryColor?: string;
  secondaryColor?: string;
  theme: AppThemeEnum;
  auto?: boolean;
}

export enum AppThemeEnum {
  dark = 'dark',
  transparent = 'transparent',
  light = 'light',
}
