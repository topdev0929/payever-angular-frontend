import { CheckboxLabelPosition, CheckboxSize } from '../enums';
import { CheckboxChangeEvent } from './checkbox-change-event.interface';

export interface CheckboxSettingsInterface {
  ariaLabel?: string;
  indeterminate?: boolean;
  labelPosition?: CheckboxLabelPosition;
  size?: CheckboxSize;
  onValueChange?: (event: CheckboxChangeEvent) => void;
}
