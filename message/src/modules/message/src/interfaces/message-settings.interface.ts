import { PeMessageAppearanceColorBox } from './message-appearance.interface';

export interface PeMessageSettings {
  currentTheme?: string;
  themes?: PeMessageSettingsThemeItem[];
}

export interface PeMessageSettingsThemeItem {
  isDefault?: boolean;
  _id?: string;
  name?: string;
  settings: PeMessageSettingsThemeItemValues;
}

export interface PeMessageSettingsThemeItemValues {
  bgChatColor?: string;
  accentColor?: string;
  messageWidgetShadow?: string;
  messagesTopColor?: string;
  messagesBottomColor?: string;
  messageAppColor?: string;
  defaultPresetColor?: number;
  customPresetColors: PeMessageAppearanceColorBox[];
}
