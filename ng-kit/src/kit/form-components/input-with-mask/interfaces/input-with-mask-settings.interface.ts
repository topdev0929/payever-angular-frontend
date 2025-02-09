export interface InputWithMaskChangeEvent {
  value: number;
}

export type UnmaskCallback = (value: string) => string;

export interface InputWithMaskSettingsInterface {
  placeholder?: string;
  mask?: (RegExp | string)[];
  unmask?: UnmaskCallback;
  onValueChange?(event: InputWithMaskChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
