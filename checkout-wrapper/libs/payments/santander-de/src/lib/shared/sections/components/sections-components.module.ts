import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { DialogModule } from '@pe/checkout/dialog';
import { FormUtilsModule } from '@pe/checkout/form-utils';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutAddressAutocompleteModule } from '@pe/checkout/forms/address-autocomplete';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { UiModule } from '@pe/checkout/ui';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';
import { UtilsModule } from '@pe/checkout/utils';

import { BankFormComponent } from './bank-form';
import { CustomerFormComponent } from './customer-form';
import { EmploymentFormComponent } from './employment-form';
import { GuarantorDetailsFormComponent } from './guarantor-details';
import { IncomeFormComponent } from './income-form';
import {
  InsurancePackageDialogComponent,
  ProtectionFormComponent,
  ProtectionFormStylesComponent,
} from './protection-form';

@NgModule({
  declarations: [
    IncomeFormComponent,
    BankFormComponent,
    CustomerFormComponent,
    EmploymentFormComponent,
    GuarantorDetailsFormComponent,
    ProtectionFormComponent,
    ProtectionFormStylesComponent,
    InsurancePackageDialogComponent,
  ],
  imports: [
    DialogModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CheckoutFormsCoreModule,
    CheckoutFormsDateModule,
    CheckoutFormsInputModule,
    CheckoutFormsInputCurrencyModule,
    CheckoutAddressAutocompleteModule,
    FormUtilsModule,
    UiModule,
    MatProgressSpinnerModule,
    CheckoutUiTooltipModule,
    UtilsModule,
  ],
  exports: [
    IncomeFormComponent,
    BankFormComponent,
    CustomerFormComponent,
    EmploymentFormComponent,
    GuarantorDetailsFormComponent,
    ProtectionFormComponent,
  ],
})
export class SectionsComponentsModule { }
