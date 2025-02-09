export interface InputCreditCardNumberChangeEvent {
  value: number;
}

export interface InputCreditCardNumberSettingsInterface {
  placeholder?: string;
  onValueChange?(event: InputCreditCardNumberChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
