import { RadioGroupLabelPosition, RadioGroupOrientation } from '../enums';
import { RadioButtonInterface } from './radio-button.interface';
import { RadioChangeEvent } from './radio-change-event.interface';

export interface RadioGroupSettingsInterface {
  radioButtons?: RadioButtonInterface[];
  labelPosition?: RadioGroupLabelPosition;
  orientation?: RadioGroupOrientation;
  onValueChange?: (event: RadioChangeEvent) => void;
}
