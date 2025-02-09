import { Component, Injector } from '@angular/core';
import { FormGroup } from '@angular/forms';

import {
  FormAbstractComponent,
  FormSchemeField,
  FormScheme,
  ErrorBag
} from '../../../../../../kit';
import { FormFieldType } from '../../../../../../kit/form';

interface FormValues {
  phone: string;
}

@Component({
  selector: 'doc-example-phone-input-no-validation',
  templateUrl: './phone-input-doc-example-no-validation.component.html',
})
export class PhoneInputDocExampleNoValidation extends FormAbstractComponent<FormValues> {

  onValueChange: (changed: string) => void = () => null;
  onBlur: () => void = () => null;
  onFocus: () => void = () => null;

  fieldset: FormSchemeField[] = [{
    name: 'phone',
    type: FormFieldType.PhoneInput,
    fieldSettings: {
      classList: 'col-xs-4',
      label: 'Phone'
    },
    phoneInputSettings: {
      placeholder: 'Input your Phone',
      onValueChange: this.onValueChange,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
    }
  }];

  formScheme: FormScheme = {
    fieldsets: { fieldset: this.fieldset }
  };

  form: FormGroup = this.formBuilder.group({
    phone: '+49 40 32527414'
  });

  formStorageKey: string = 'PhoneInputDocExampleNoValidation';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag
  ) {
    super(injector);
  }

  createForm(): void {
    // stub method
  }

  onUpdateFormData(): void {
    // stub method
  }

  onSuccess(): void {
    // stub method
  }

}
