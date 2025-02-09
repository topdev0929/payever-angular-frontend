import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';
import { UtilsModule } from '@pe/checkout/utils';

import { DetailsFormComponent } from './_root';
import { AmlFormComponent } from './aml';
import { DebtFormComponent } from './debt';
import { DetailsSummaryComponent } from './details-summery';
import {
  MortgageLoansFormComponent,
  SecuredLoansFormComponent,
  StudentLoansFormComponent,
} from './loans';
import { MonthlyExpensesFormComponent } from './monthly-expenses';
import { PersonalFormComponent } from './personal';

@NgModule({
  declarations: [
    DetailsFormComponent,
    AmlFormComponent,
    PersonalFormComponent,
    DebtFormComponent,
    MortgageLoansFormComponent,
    SecuredLoansFormComponent,
    StudentLoansFormComponent,
    MonthlyExpensesFormComponent,
    DetailsSummaryComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaymentTextModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    UtilsModule,
    CheckoutFormsInputModule,
    CheckoutFormsInputCurrencyModule,
    CheckoutUiTooltipModule,
    CheckoutFormsCoreModule,
    CheckoutFormsDateModule,
    ContinueButtonModule,
  ],
})
export class DetailsSectionModule {
  resolveComponent(): Type<DetailsFormComponent> {
    return DetailsFormComponent;
  }
}
