import { RadioChangeInterface } from './radio-change.interface';
import { ThemePaletteType } from './theme-palette.type';

export interface RadioButtonInterface {
  ariaDescribedby?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  checked?: boolean;
  color?: ThemePaletteType;
  disableRipple?: boolean;
  disabled?: boolean;
  labelPosition?: 'before' | 'after';
  name?: string;
  required?: boolean;
  title: string;
  value?: any;
  change?: (change: RadioChangeInterface) => void;
}
