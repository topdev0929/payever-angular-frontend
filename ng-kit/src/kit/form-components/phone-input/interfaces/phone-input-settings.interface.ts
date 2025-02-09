export interface PhoneInputSettingsInterface {
  placeholder?: string;
  onValueChange?(value: string): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
