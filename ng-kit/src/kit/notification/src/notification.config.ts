export type PositionType = 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'top-center' | 'center-center';
export type StyleType = 'default' | 'dark';
export type ThemeType = 'light' | 'dark';
export type IconSize = 16 | 24 | 32 | 48 | 64 | 96;

export interface NotificationConfig {
  message?: string;
  icon?: string;
  svgIconId?: string;
  svgIconClass?: string;
  timeOut?: number;
  position?: PositionType;
  showCloseBtn?: boolean;
  style?: StyleType;
  dynamicComponent?: any;
}

export const NotificationDefaultConfig: NotificationConfig = {
  message: '',
  icon: null,
  timeOut: 5000,
  position: 'top-right',
  showCloseBtn: true,
  style: 'default'
};

export interface NotificationItemConfig {
  title?: string;
  subtitle?: string;
  message?: string;
  theme?: ThemeType;
  iconId?: string;
  iconSize?: IconSize;
  position?: PositionType;
  timeOut?: number;
  isNotViewed?: boolean;
  createdDate?: string;
  hideCloseBtn?: boolean;
  isClickable?: boolean;
}

export const NotificationItemDefaultConfig: NotificationItemConfig = {
  message: '',
  theme: 'dark',
  position: 'top-right',
  timeOut: 5000,
  iconSize: 16,
  isClickable: false
};
