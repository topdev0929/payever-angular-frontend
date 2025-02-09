import { CommonModule } from '@angular/common';
import { Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { DialogModule } from '@pe/checkout/dialog';
import { FormUtilsModule } from '@pe/checkout/form-utils';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import {
  RatesCalculationApiService,
  RatesCalculationService,
  ratesCalculationServiceFactory,
} from '@pe/checkout/santander-de-pos/shared';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';
import { UtilsModule } from '@pe/checkout/utils';


import {
  SummaryIncomeEmploymentComponent,
  ProtectionFormComponent,
  ProtectionFormStylesComponent,
  IncomeFormComponent,
  EmploymentFormComponent,
  InsurancePackageDialogComponent,
} from './components';


@NgModule(
  {
    declarations: [
      SummaryIncomeEmploymentComponent,

      EmploymentFormComponent,
      IncomeFormComponent,
      ProtectionFormComponent,
      InsurancePackageDialogComponent,
      ProtectionFormStylesComponent,
    ],
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      ContinueButtonModule,
      UtilsModule,
      FormUtilsModule,
      DialogModule,

      MatCheckboxModule,
      MatFormFieldModule,
      MatInputModule,
      MatRadioModule,
      MatSelectModule,
      CheckoutFormsCoreModule,
      CheckoutFormsDateModule,
      CheckoutFormsInputModule,
      CheckoutFormsInputCurrencyModule,
    ],
    exports: [
      SummaryIncomeEmploymentComponent,
      EmploymentFormComponent,
      IncomeFormComponent,
      ProtectionFormComponent,
    ],
    providers: [
      RatesCalculationApiService,
      { provide: RatesCalculationService, useFactory: ratesCalculationServiceFactory, deps: [Injector] },
    ],
  }
)
export class IncomeModule {
}
