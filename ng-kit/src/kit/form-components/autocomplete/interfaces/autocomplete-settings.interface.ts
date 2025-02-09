import { AutocompleteChangeEvent } from './autocomplete-change-event.interface';

export interface AutocompleteSettingsInterface {
  autocompleteClassList?: string;
  ariaLabel?: string;
  autoActiveFirstOption?: boolean;
  displayByField?: string;
  displayWith?: ((value: any) => string | null) | null;
  displayOptionByField?: string;
  displayOptionWith?: ((value: any) => string | null) | null;
  filter?: ((options: any[], value: any) => any[]) | null;
  filterByField?: string;
  options?: any[];
  placeholder?: string;
  onValueChange?(event: AutocompleteChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
