import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { BasePaymentDetailsModule } from '@pe/checkout/payment';
import { UiModule } from '@pe/checkout/ui';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import {
  RatesCalculationService,
  SharedModule,
} from '../shared';

import { InquiryContainerComponent, InquiryFormComponent } from './components';
import { RequestDocsService } from './services';

@NgModule({
  declarations: [
    InquiryFormComponent,
    InquiryContainerComponent,
  ],
  exports: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaymentTextModule,
    UiModule,
    CheckoutFormsCoreModule,
    SharedModule,
  ],
  providers: [
    RatesCalculationService,
    RequestDocsService,
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PAYMENT_DETAILS',
      },
    },
  ],
})
export class SantanderFactDeInquiryModule extends BasePaymentDetailsModule {
  resolvePaymentDetailsStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
