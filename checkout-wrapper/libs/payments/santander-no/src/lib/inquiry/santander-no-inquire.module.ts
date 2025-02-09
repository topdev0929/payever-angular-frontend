import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { FormUtilsModule, LAZY_PAYMENT_SECTIONS } from '@pe/checkout/form-utils';
import { ABSTRACT_PAYMENT_SERVICE, BasePaymentDetailsModule, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { UiModule } from '@pe/checkout/ui';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import { PaymentService, FormConfigService } from '../shared';

import { InquiryContainerComponent } from './components';
import { LAZY_PAYMENT_SECTIONS_NO } from './lazy-payment-sections.config';

@NgModule({
  declarations: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    UiModule,
    ReactiveFormsModule,
    PaymentTextModule,
    FormUtilsModule,
  ],
  providers: [
    FormConfigService,
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
    {
      provide: LAZY_PAYMENT_SECTIONS,
      useValue: LAZY_PAYMENT_SECTIONS_NO,
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
export class SantanderNoInquireModule extends BasePaymentDetailsModule {
  public resolvePaymentDetailsStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
