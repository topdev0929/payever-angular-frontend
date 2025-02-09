import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { RatesModule } from '@pe/checkout/rates';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { UtilsModule } from '@pe/checkout/utils';

import { DetailsFormComponent, DetailsFormService, TermsFormComponent } from './components';
import { CcpRateComponent, RateEditListComponent } from './components/rate-edit-list';
import { TermsFormService } from './components/terms-form/terms-form.service';


@NgModule(
  {
    declarations: [
      CcpRateComponent,
      RateEditListComponent,
      DetailsFormComponent,
      TermsFormComponent,
    ],
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      RatesModule,
      PaymentTextModule,
      UtilsModule,

      MatCheckboxModule,
      MatFormFieldModule,
      MatInputModule,
      MatProgressSpinnerModule,
      MatSelectModule,
      CheckoutFormsCoreModule,
      CheckoutFormsDateModule,
      CheckoutFormsInputModule,
      CheckoutFormsInputCurrencyModule,
      ContinueButtonModule,
    ],
    exports: [
      RateEditListComponent,
      DetailsFormComponent,
      TermsFormComponent,

      ContinueButtonModule,
    ],

    providers: [
      DetailsFormService,
      TermsFormService,
      {
        provide: ANALYTICS_FORM_SETTINGS,
        useValue: {
          formName: 'FORM_PAYMENT_DETAILS',
        },
      },
    ],
  }
)
export class RateModule {
}
