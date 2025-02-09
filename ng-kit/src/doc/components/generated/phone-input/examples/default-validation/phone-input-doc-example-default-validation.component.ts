import { Component, Injector } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import {
  FormAbstractComponent,
  FormSchemeField,
  FormScheme,
  ErrorBag,
  phoneInputValidator
} from '../../../../../../kit';
import { FormFieldType } from '../../../../../../kit/form';

interface FormValues {
  phone: string;
}

@Component({
  selector: 'doc-example-phone-input-default-validation',
  templateUrl: './phone-input-doc-example-default-validation.component.html',
})
export class PhoneInputDocExampleDefaultValidation extends FormAbstractComponent<FormValues> {

  fieldset: FormSchemeField[] = [{
    name: 'phone',
    type: FormFieldType.PhoneInput,
    fieldSettings: {
      classList: 'col-xs-4',
      label: 'Phone',
      required: true,
    },
    phoneInputSettings: {
      placeholder: 'Input your Phone',
    }
  }];

  formScheme: FormScheme = {
    fieldsets: { fieldset: this.fieldset }
  };

  form: FormGroup = this.formBuilder.group({
    phone: ['+47 20 614323', [Validators.required, phoneInputValidator()]]
  });

  formStorageKey: string = 'PhoneInputDocExampleDefaultValidation';

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
