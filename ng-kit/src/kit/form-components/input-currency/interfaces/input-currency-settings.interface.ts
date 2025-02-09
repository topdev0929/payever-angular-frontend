export interface InputCurrencyChangeEvent {
  value: number;
}

export interface InputCurrencySettingsInterface {
  placeholder?: string;
  maxLength?: number;
  onValueChange?(event: InputCurrencyChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
