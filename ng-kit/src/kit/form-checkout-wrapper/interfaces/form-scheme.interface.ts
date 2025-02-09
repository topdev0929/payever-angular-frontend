import { Observable } from 'rxjs';

import { FormFieldEnum } from '../../form-core/types';

import { InputCurrencySettingsInterface } from '../../form-components/input-currency';
import { AutocompleteGooglePlacesSettingsInterface } from '../../form-components/autocomplete';
import { BaseFormScheme, BaseFormSchemeField, BaseFormSchemeFieldsets } from '../../form-core/interfaces/form-scheme.interface';

export interface FormSchemeFieldsets extends BaseFormSchemeFieldsets<FormSchemeField> {}

export interface FormScheme extends BaseFormScheme<FormSchemeField> {}

export enum FormFieldType {
  Input = FormFieldEnum.Input,
  InputCurrency = FormFieldEnum.InputCurrency,
  AutocompleteGooglePlaces = FormFieldEnum.AutocompleteGooglePlaces,
}

export interface FormSchemeField extends BaseFormSchemeField {
  type: FormFieldType;

  inputCurrencySettings?: InputCurrencySettingsInterface | Observable<InputCurrencySettingsInterface>;
  autocompleteGooglePlacesSettings?: AutocompleteGooglePlacesSettingsInterface | Observable<AutocompleteGooglePlacesSettingsInterface>;
}
