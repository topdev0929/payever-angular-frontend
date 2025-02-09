import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { DialogModule } from '@pe/checkout/dialog';
import { FinishModule } from '@pe/checkout/finish';
import { FormUtilsModule } from '@pe/checkout/form-utils';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { ABSTRACT_PAYMENT_SERVICE, BaseChoosePaymentStepContainer, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { RatesModule } from '@pe/checkout/rates';
import { UiModule } from '@pe/checkout/ui';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { DEFAULT_POLLING_CONFIG, POLLING_CONFIG } from '@pe/checkout/utils/poll';

import { UtilStepService } from '../services';
import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import {
  PaymentService,
  RatesCalculationApiService,
  RatesCalculationService,
  SantanderSeApiService,
  SantanderSeFlowService,
  SeTrackingService,
} from '../shared';

import {
  ConditionsDialogComponent,
  FormComponent,
  RatesContainerComponent,
  RatesEditListComponent,
  SsnFormComponent,
  TermsFormComponent,
} from './components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,

    RatesModule,
    UiModule,
    DialogModule,
    FinishModule,
    FormUtilsModule,
    PaymentTextModule,

    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    CheckoutFormsCoreModule,
  ],
  declarations: [
    ConditionsDialogComponent,
    RatesContainerComponent,
    RatesEditListComponent,
    FormComponent,

    SsnFormComponent,
    TermsFormComponent,
  ],
  providers: [
    RatesCalculationService,
    RatesCalculationApiService,
    SantanderSeFlowService,
    SantanderSeApiService,
    UtilStepService,
    SeTrackingService,
    {
      provide: POLLING_CONFIG,
      useValue: DEFAULT_POLLING_CONFIG,
    },
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PAYMENT_DETAILS',
      },
    },
  ],
})
export class SantanderSeRatesModule extends BaseChoosePaymentStepContainer {
  resolveChoosePaymentStepContainerComponent(): Type<RatesContainerComponent> {
    return RatesContainerComponent;
  }
}
