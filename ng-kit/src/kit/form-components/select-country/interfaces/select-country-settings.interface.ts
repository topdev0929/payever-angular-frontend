import { SelectCountryChangeEvent } from './select-country-change-event.interface';

export interface SelectCountrySettingsInterface {
  disableOptionCentering?: boolean;
  multiple?: boolean;
  panelClass?: string;
  panelHeight?: number;
  placeholder?: string;
  showPhoneCodes?: boolean;
  addPhoneCodeToValue?: boolean;
  scrollToInitElement?: string;
  onOpenedChange?(opened: boolean): void;
  onValueChange?(event: SelectCountryChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
