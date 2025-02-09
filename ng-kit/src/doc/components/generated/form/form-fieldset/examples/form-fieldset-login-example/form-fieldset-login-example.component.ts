import { Component, ChangeDetectionStrategy, Injector } from '@angular/core';
import { Validators } from '@angular/forms';

import {
  ErrorBag,
  FormAbstractComponent,
  FormScheme,
  FormFieldType
} from '../../../../../../../kit/form-login';

interface MyFormInterface {
  inputValue: string;
  inputPasswordValue: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'doc-form-fieldset-login-example',
  templateUrl: 'form-fieldset-login-example.component.html',
  providers: [ErrorBag]
})
export class FormFieldsetLoginExampleComponent extends FormAbstractComponent<MyFormInterface> {

  formTranslationsScope: 'test_fieldset.form';
  formScheme: FormScheme;
  testFieldset: any;

  protected formStorageKey: string = 'test_fieldset.form';

  constructor(
    injector: Injector,
    protected errorBag: ErrorBag
  ) {
    super(injector);
  }

  onSuccess(): void {
    alert('Success!');
  }

  disableAll(): void {
    this.toggleControl('inputValue', false);
    this.toggleControl('inputPasswordValue', false);
  }

  enableAll(): void {
    this.toggleControl('inputValue', true);
    this.toggleControl('inputPasswordValue', true);
  }

  saveToCache(): void {
    this.saveDataToStorage();
  }

  addExternalErrors(): void {
    // Without this flag error state matcher will not be triggered
    this.isSubmitted = true;

    this.errorBag.setErrors({
      inputValue: 'Some external error for inputValue',
      inputPasswordValue: 'Some external error for inputPasswordValue',
    });
  }

  protected createForm(initialData: MyFormInterface): void {
    this.form = this.formBuilder.group({
      inputValue: [initialData.inputValue, [Validators.required]],
      inputPasswordValue: [initialData.inputPasswordValue, [Validators.required]]
    });

    this.formScheme = {
      fieldsets: {
        first: [
          {
            name: 'inputValue',
            type: FormFieldType.Input,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-6',
              required: true
            },
            inputSettings: {
              placeholder: 'Input placeholder'
            }
          },
          {
            name: 'inputPasswordValue',
            type: FormFieldType.InputPassword,
            fieldSettings: {
              classList: 'col-xs-12 col-sm-6',
              required: true
            }
          }
        ]
      }
    };

    this.testFieldset = this.formScheme.fieldsets['first'];
    this.changeDetectorRef.detectChanges();
  }

  protected onUpdateFormData(formValues: MyFormInterface): void {
    // stub method
  }

}
