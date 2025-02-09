import { ColorPickerAlign, ColorPickerFormat } from '../enums';
import { ColorPickerChangeEvent } from './color-picker-change-event.interface';

export interface ColorPickerSettingsInterface {
  align?: ColorPickerAlign;
  alpha?: boolean;
  complex?: boolean;
  format?: ColorPickerFormat;
  onClose?: () => void;
  onClosed?: (event: any) => void;
  onOpened?: (event: any) => void;
  onValueChange?: (event: ColorPickerChangeEvent) => void;
}
