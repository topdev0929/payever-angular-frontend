import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { LAZY_PAYMENT_SECTIONS } from '@pe/checkout/form-utils';
import { BasePaymentDetailsModule, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { FormConfigService, LAZY_PAYMENT_SECTIONS_DK, SharedModule } from '@pe/checkout/santander-dk/shared';
import { UtilsModule } from '@pe/checkout/utils';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';

import { InquiryContainerComponent } from './components';


@NgModule({
  declarations: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    UtilsModule,
    SharedModule,
  ],
  providers: [
    FormConfigService,
    {
      provide: LAZY_PAYMENT_SECTIONS,
      useValue: LAZY_PAYMENT_SECTIONS_DK,
    },
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PAYMENT_DETAILS',
      },
    },
  ],
})
export class SantanderDkInquiryModule extends BasePaymentDetailsModule {
  resolvePaymentDetailsStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
