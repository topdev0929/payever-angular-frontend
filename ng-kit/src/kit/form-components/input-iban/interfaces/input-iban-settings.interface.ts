export interface InputIbanChangeEvent {
  value: number;
}

export interface InputIbanSettingsInterface {
  placeholder?: string;
  onValueChange?(event: InputIbanChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
