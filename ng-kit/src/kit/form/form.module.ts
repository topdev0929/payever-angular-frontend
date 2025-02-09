import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxWebstorageModule } from 'ngx-webstorage';

import { MAT_RIPPLE_GLOBAL_OPTIONS } from '@angular/material/core';

import { FormCoreModule } from '../form-core';

import { FormComponentsAutocompleteModule } from '../form-components/autocomplete';
import { FormComponentsButtonToggleModule } from '../form-components/button-toggle';
import { FormComponentsCheckboxModule } from '../form-components/checkbox';
import { FormComponentsColorPickerModule } from '../form-components/color-picker';
import { FormComponentsDatepickerModule } from '../form-components/datepicker';
import { FormComponentsFilePickerModule } from '../form-components/file-picker';
import { FormComponentsImagePickerModule } from '../form-components/image-picker';
import { FormComponentsInputModule } from '../form-components/input';
import { FormComponentsIframeInputModule } from '../form-components/iframe-input';
import { FormComponentsIframeInputIbanModule } from '../form-components/iframe-input-iban';
import { FormComponentsInputCreditCardExpirationModule } from '../form-components/input-credit-card-expiration';
import { FormComponentsInputCreditCardNumberModule } from '../form-components/input-credit-card-number';
import { FormComponentsInputWithMaskModule } from '../form-components/input-with-mask';
import { FormComponentsInputCurrencyModule } from '../form-components/input-currency';
import { FormComponentsInputIbanModule } from '../form-components/input-iban';
import { FormComponentsInputPasswordModule } from '../form-components/input-password';
import { FormComponentsInputSpinnerModule } from '../form-components/input-spinner';
import { FormComponentsPhoneInputModule } from '../form-components/phone-input';
import { FormComponentsRadioModule } from '../form-components/radio';
import { FormComponentsSelectModule } from '../form-components/select';
import { FormComponentsSelectCountryModule } from '../form-components/select-country';
import { FormComponentsSliderModule } from '../form-components/slider';
import { FormComponentsSlideToggleModule } from '../form-components/slide-toggle';
import { FormComponentsTableGridPickerModule } from '../form-components/table-grid-picker';
import { FormComponentsTextareaModule } from '../form-components/textarea';

import { TooltipIconModule } from '../form-components/tooltip-icon';

import { FormFieldsetComponent } from './components';

const shared: any = [
  FormFieldsetComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxWebstorageModule.forRoot({
      prefix: 'pe.common',
      separator: '.',
      caseSensitive: true
    }),
    FormCoreModule,

    FormComponentsAutocompleteModule,
    FormComponentsButtonToggleModule,
    FormComponentsCheckboxModule,
    FormComponentsColorPickerModule,
    FormComponentsDatepickerModule,
    FormComponentsFilePickerModule,
    FormComponentsImagePickerModule,
    FormComponentsInputModule,
    FormComponentsIframeInputModule,
    FormComponentsIframeInputIbanModule,
    FormComponentsInputCreditCardExpirationModule,
    FormComponentsInputCreditCardNumberModule,
    FormComponentsInputWithMaskModule,
    FormComponentsInputCurrencyModule,
    FormComponentsInputIbanModule,
    FormComponentsInputPasswordModule,
    FormComponentsInputSpinnerModule,
    FormComponentsPhoneInputModule,
    FormComponentsRadioModule,
    FormComponentsSelectModule,
    FormComponentsSelectCountryModule,
    FormComponentsSliderModule,
    FormComponentsSlideToggleModule,
    FormComponentsTableGridPickerModule,
    FormComponentsTextareaModule,

    TooltipIconModule
  ],
  declarations: [
    ...shared
  ],
  entryComponents: [
    ...shared
  ],
  exports: [
    ...shared,
    FormCoreModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      // TODO Maybe move to form components?
      provide: MAT_RIPPLE_GLOBAL_OPTIONS,
      useValue: { disabled: true }
    }
  ]
})
export class FormModule {}
