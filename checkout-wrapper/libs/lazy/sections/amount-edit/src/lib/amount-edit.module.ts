import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { UiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';

import { AmountEditFormComponent } from './components';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSelectModule,

    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
    CheckoutFormsInputCurrencyModule,
    UiModule,
    UtilsModule,
  ],
  declarations: [
    AmountEditFormComponent,
  ],
  exports: [
    AmountEditFormComponent,
  ],
  providers: [
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_AMOUNT_EDIT',
      },
    },
  ],
})
export class AmountEditModule {
  resolveAmountEditFormComponent(): Type<AmountEditFormComponent> {
    return AmountEditFormComponent;
  }
}
