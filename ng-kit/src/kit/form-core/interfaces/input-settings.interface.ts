import { InputType } from '../enums';
import { InputChangeEvent } from './input-change-event.interface';

export interface InputSettingsInterface {
  placeholder?: string;
  type?: InputType;
  maxLength?: number;
  minLength?: number;
  numberMin?: number;
  numberMax?: number;
  numberIsInteger?: boolean;
  showNumberControls?: boolean;
  nameAttribute?: string;
  autocompleteAttribute?: string;
  debounceTime?: number;
  onValueChange?(event: InputChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
