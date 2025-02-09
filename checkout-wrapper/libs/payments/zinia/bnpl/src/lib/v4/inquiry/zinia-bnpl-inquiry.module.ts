//Zinia BNPL
import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import {
  ABSTRACT_PAYMENT_SERVICE,
  BaseChoosePaymentStepContainer,
  PaymentErrorComponent,
  PAYMENT_SETTINGS,
} from '@pe/checkout/payment';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { PromoComponent } from '../../shared';
import { ZiniaBnplApiService, ZiniaBnplFlowService, ZiniaPaymentService } from '../services';

import {
  DetailsFormComponent,
  InquiryContainerComponent,
  InquiryFormComponent,
  TermsFormComponent,
} from './components';
import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from './settings';

@NgModule({
  declarations: [
    InquiryFormComponent,
    InquiryContainerComponent,
    DetailsFormComponent,
    TermsFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CheckoutFormsCoreModule,
    CheckoutFormsDateModule,
    CheckoutFormsInputModule,
    PaymentTextModule,

    PromoComponent,
    PaymentErrorComponent,
  ],
  exports: [
    InquiryContainerComponent,
  ],
  providers: [
    ZiniaBnplApiService,
    ZiniaBnplFlowService,
    ZiniaPaymentService,
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: ZiniaPaymentService,
    },
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PAYMENT_DETAILS',
      },
    },
  ],
})
export class ZiniaBNPLInquiryModuleV4 extends BaseChoosePaymentStepContainer {

  public resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
