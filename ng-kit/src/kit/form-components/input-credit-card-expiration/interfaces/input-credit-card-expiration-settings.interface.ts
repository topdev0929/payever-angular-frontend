export interface InputCreditCardExpirationChangeEvent {
  value: number;
}

export interface InputCreditCardExpirationSettingsInterface {
  placeholder?: string;
  onValueChange?(event: InputCreditCardExpirationChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
