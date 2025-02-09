import { ThemePaletteType } from '../../../form-core/types';
import { RadioGroupLabelPosition } from '../enums';
import { RadioChangeEvent } from './radio-change-event.interface';

export interface RadioButtonInterface {
  ariaDescribedby?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  checked?: boolean;
  color?: ThemePaletteType;
  disabled?: boolean;
  labelPosition?: RadioGroupLabelPosition;
  required?: boolean;
  title: string;
  value?: any;
  onValueChange?: (event: RadioChangeEvent) => void;
}
