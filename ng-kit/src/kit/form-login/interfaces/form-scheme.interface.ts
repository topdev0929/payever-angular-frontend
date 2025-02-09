import { Observable } from 'rxjs';

import { FormFieldEnum } from '../../form-core/types';
import { InputPasswordSettingsInterface } from '../../form-components/input-password';
import { BaseFormScheme, BaseFormSchemeField, BaseFormSchemeFieldsets } from '../../form-core/interfaces/form-scheme.interface';

export interface FormSchemeFieldsets extends BaseFormSchemeFieldsets<FormSchemeField> {}

export interface FormScheme extends BaseFormScheme<FormSchemeField> {}

export enum FormFieldType {
  Input = FormFieldEnum.Input,
  InputPassword = FormFieldEnum.InputPassword
}

export interface FormSchemeField extends BaseFormSchemeField {
  type: FormFieldType;

  inputPasswordSettings?: InputPasswordSettingsInterface | Observable<InputPasswordSettingsInterface>;
}
