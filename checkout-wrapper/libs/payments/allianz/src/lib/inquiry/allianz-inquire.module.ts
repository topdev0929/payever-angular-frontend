import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, PAYMENT_SETTINGS } from '@pe/checkout/payment';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import { PaymentService } from '../shared';

import { InquiryContainerComponent } from './components';

@NgModule({
  declarations: [
    InquiryContainerComponent,
  ],
  exports: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
  ],
  providers: [
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
  ],
})
export class AllianzInquiryModule {
  public resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
