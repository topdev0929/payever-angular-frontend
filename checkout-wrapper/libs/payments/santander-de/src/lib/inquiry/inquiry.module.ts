import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { FormUtilsModule, LAZY_PAYMENT_SECTIONS } from '@pe/checkout/form-utils';
import { ABSTRACT_PAYMENT_SERVICE, BasePaymentDetailsModule, PAYMENT_SETTINGS } from '@pe/checkout/payment';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import { PaymentService, SantanderDeApiService, SantanderDeFlowService } from '../shared';

import { InquiryContainerComponent } from './components';
import { LAZY_PAYMENT_SECTIONS_DE } from './constants';

@NgModule({
  declarations: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    FormUtilsModule,
  ],
  exports: [
    InquiryContainerComponent,
  ],
  providers: [
    {
      provide: LAZY_PAYMENT_SECTIONS,
      useValue: LAZY_PAYMENT_SECTIONS_DE,
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
    SantanderDeFlowService,
    SantanderDeApiService,
  ],
})
export class InquiryModule extends BasePaymentDetailsModule {
  resolvePaymentDetailsStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
