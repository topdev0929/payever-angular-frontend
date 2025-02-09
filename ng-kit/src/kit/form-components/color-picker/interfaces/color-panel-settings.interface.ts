import { ColorPickerChangeEvent } from "./color-picker-change-event.interface";
import { ColorPickerFormat } from "../enums";

export interface ColorPanelSettingsInterface {
  format?: ColorPickerFormat;
  onClose?: () => void;
  onValueChange?: (event: ColorPickerChangeEvent) => void;
}
