import { AutocompleteSettingsInterface } from './autocomplete-settings.interface';
import { AutocompleteValidateCallback } from './autocomplete.type';
import { FormControl } from '@angular/forms';
import { SelectOptionInterface } from '../../select/interfaces';
import { AutocompleteChipsSize } from '../enums';

export enum AutocompleteChipsType {
  DEFAULT = 'DEFAULT',
  COLOR = 'COLOR'
}

export interface AutoCompleteChipsAddOptionInterface {
  name?: string;
  onClick?(data: FormControl): void;
}

export interface BaseAutocompleteChipsSettingsInterface extends AutocompleteSettingsInterface {
  type?: AutocompleteChipsType;
  validateInput?: AutocompleteValidateCallback;
  separatorKeys?: number[];
  addOptionButton?: AutoCompleteChipsAddOptionInterface;
  chipsSize?: AutocompleteChipsSize;
}

export interface AutocompleteChipsSettingsInterface extends BaseAutocompleteChipsSettingsInterface {
  type?: AutocompleteChipsType.DEFAULT;
}

export interface ColorAutocompleteChipsSettingsInterface extends BaseAutocompleteChipsSettingsInterface {
  type: AutocompleteChipsType.COLOR;
  options: SelectOptionInterface[];
  colorCheckboxClasses?: string;
}
