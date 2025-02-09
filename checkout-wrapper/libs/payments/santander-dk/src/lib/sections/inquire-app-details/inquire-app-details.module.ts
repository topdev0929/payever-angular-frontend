import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutAddressAutocompleteModule } from '@pe/checkout/forms/address-autocomplete';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';
import { CheckoutUiIconModule } from '@pe/checkout/ui/icon';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { UtilsModule } from '@pe/checkout/utils';

import { SharedModule } from '../../shared';

import {
  InquireFormAppDetailsComponent,

  BankDetailsFormComponent,
  ChildrenFormComponent,
  CarsFormComponent,
  ConfirmFormComponent,
  CprDetailsFormComponent,
  ExposedPersonFormComponent,
  FinanceDetailsFormComponent,
  PersonalFormComponent,
  SafeInsuranceFormComponent,
} from './components';

@NgModule({
  declarations: [
    InquireFormAppDetailsComponent,

    BankDetailsFormComponent,
    CarsFormComponent,
    ChildrenFormComponent,
    ConfirmFormComponent,
    CprDetailsFormComponent,
    ExposedPersonFormComponent,
    FinanceDetailsFormComponent,
    PersonalFormComponent,
    SafeInsuranceFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContinueButtonModule,
    PaymentTextModule,
    SharedModule,

    MatAutocompleteModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
    CheckoutFormsInputCurrencyModule,
    CheckoutAddressAutocompleteModule,
    UtilsModule,
    CheckoutFormsDateModule,
    CheckoutUiIconModule,
  ],
})
export class InquireAppDetailsModule {
  resolveComponent(): Type<InquireFormAppDetailsComponent> {
    return InquireFormAppDetailsComponent;
  }
}
