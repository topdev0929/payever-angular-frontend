import { TextareaChangeEvent } from './textarea-change-event.interface';

export interface TextAreaSettingsInterface {
  maxRows?: number;
  minRows?: number;
  placeholder?: string;
  onValueChange?(event: TextareaChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
