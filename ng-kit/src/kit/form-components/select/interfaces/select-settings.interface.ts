import { SelectChangeEvent } from './select-change-event.interface';
import { SelectOptionGroupInterface, SelectOptionInterface } from './select-option.interface';
import { AutoCompleteChipsAddOptionInterface } from '../../autocomplete/interfaces';

export interface SelectSettingsInterface {
  disableOptionCentering?: boolean;
  multiple?: boolean;
  options?: SelectOptionInterface[];
  optionGroups?: SelectOptionGroupInterface[];
  panelClass?: string;
  rawLabels?: boolean;
  label?: string;
  placeholder?: string;
  singleLineMode?: boolean;
  singleLineMoreText?: string;
  addOptionButton?: AutoCompleteChipsAddOptionInterface;
  saveOptionButton?: AutoCompleteChipsAddOptionInterface;
  optionClass?: string;
  onOpenedChange?(opened: boolean): void;
  onValueChange?(event: SelectChangeEvent): void;
  onFocus?(event: FocusEvent): void;
  onBlur?(event: FocusEvent): void;
}
