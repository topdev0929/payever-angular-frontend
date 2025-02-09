import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutAddressAutocompleteModule } from '@pe/checkout/forms/address-autocomplete';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { AddressEditModule } from '@pe/checkout/sections/address-edit';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';
import { CheckoutUiIconModule } from '@pe/checkout/ui/icon';

import {
  PreviousAddressFormComponent,
  BankFormComponent,
  GuarantorDetailsFormComponent,
  PersonalFormComponent,
  SummaryPersonalBankComponent,
} from './components';

@NgModule(
  {
    declarations: [
      SummaryPersonalBankComponent,
      BankFormComponent,
      GuarantorDetailsFormComponent,
      PersonalFormComponent,
      PreviousAddressFormComponent,
    ],
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      AddressEditModule,
      FormUtilsModule,
      ContinueButtonModule,
      MatAutocompleteModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      CheckoutFormsCoreModule,
      CheckoutFormsDateModule,
      CheckoutFormsInputModule,
      CheckoutAddressAutocompleteModule,
      CheckoutUiIconModule,
      MatProgressSpinnerModule,
    ],
    exports: [
      SummaryPersonalBankComponent,
      BankFormComponent,
      GuarantorDetailsFormComponent,
      PersonalFormComponent,
      PreviousAddressFormComponent,
    ],
  }
)
export class PersonalModule {
}
