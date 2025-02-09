import { Component, Injector } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import {
  FormAbstractComponent,
  FormSchemeField,
  FormScheme,
  ErrorBag,
  phoneInputValidator,
  SelectOptionInterface
} from '../../../../../../kit';
import { FormFieldType } from '../../../../../../kit/form';

interface FormValues {
  phone: string;
  countryCode: string;
}

@Component({
  selector: 'doc-example-phone-input-country-code-validation',
  templateUrl: './phone-input-doc-example-country-code-validation.component.html',
})
export class PhoneInputDocExampleCountryCodeValidation extends FormAbstractComponent<FormValues> {

  countries: SelectOptionInterface[] = [
    { label: 'No Country', value: null },
    { label: 'Default', value: 'any-other-value' },
    { label: 'England (en)', value: 'en' },
    { label: 'Germany (de)', value: 'de' },
    { label: 'Sweden (sv)', value: 'sv' },
    { label: 'Sweden (sv_SE)', value: 'se' },
    { label: 'Norway (no)', value: 'no' },
    { label: 'Norway (no_NB)', value: 'nb' },
    { label: 'Denmark (da)', value: 'da' },
    { label: 'Spain (es)', value: 'es' },
  ];

  fieldset: FormSchemeField[] = [{
    name: 'countryCode',
    type: FormFieldType.Select,
    fieldSettings: {
      classList: 'col-xs-4',
      label: 'Country',
      required: true,
    },
    selectSettings: {
      placeholder: 'Choose country',
      options: this.countries,
      onValueChange: evt => {
        this.togglePhoneDisabledState(evt);
      }
    },
  }, {
    name: 'phone',
    type: FormFieldType.PhoneInput,
    fieldSettings: {
      classList: 'col-xs-4',
      label: 'Phone',
      required: true,
    },
    phoneInputSettings: {
      placeholder: 'Input your Phone',
    },
  }];

  formScheme: FormScheme = {
    fieldsets: { fieldset: this.fieldset }
  };

  form: FormGroup = this.formBuilder.group({
    phone: ['(+49) 40 325274140'],
    countryCode: ['de', Validators.required],
  });

  formStorageKey: string = 'PhoneInputDocExampleCountryCodeValidation';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag
  ) {
    super(injector);
  }

  createForm(): void {
    this.form.get('phone').setValidators([
      Validators.required,
      phoneInputValidator({ countryControl: this.form.get('countryCode') })
    ]);
  }

  onUpdateFormData(): void {
    //
  }

  onSuccess(): void {
    // stub method
  }

  private togglePhoneDisabledState({ value }: any): void {
    setTimeout(() => {
      this.form.get('phone')[value ? 'enable' : 'disable']();
    });
  }

}
