import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';

import { AnalyticsModule } from '@pe/checkout/analytics';


import {
  CheckboxErrorDirective,
  FormFieldErrorComponent,
  FormFieldErrorDirective,
} from './error';
import {
  PeDatePickerErrorStateMatcherDirective,
  CheckoutErrorStateMatcher,
} from './error/error-state-matcher';
import { PeFormGroupSubmissionDirective } from './submission.directive';

@NgModule({
  declarations: [
    PeFormGroupSubmissionDirective,
    PeDatePickerErrorStateMatcherDirective,
  ],
  imports: [
    AnalyticsModule,
    ReactiveFormsModule,
    FormFieldErrorComponent,
    FormFieldErrorDirective,
    CheckboxErrorDirective,
  ],
  exports: [
    PeFormGroupSubmissionDirective,
    PeDatePickerErrorStateMatcherDirective,
    AnalyticsModule,
    FormFieldErrorDirective,
    CheckboxErrorDirective,
  ],
  providers: [
    {
      provide: ErrorStateMatcher,
      useClass: CheckoutErrorStateMatcher,
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        hideRequiredMarker: true,
      } as MatFormFieldDefaultOptions,
    },
  ],
})
export class CheckoutFormsCoreModule {}
