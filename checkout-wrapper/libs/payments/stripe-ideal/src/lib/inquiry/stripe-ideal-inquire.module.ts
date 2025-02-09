import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { RatesModule as SdkRatesModule } from '@pe/checkout/rates';
import { UtilsModule } from '@pe/checkout/utils';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import { SharedModule, StripeCommonService, StripeFlowService } from '../shared';

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
    FormUtilsModule,
    FormsModule,
    UtilsModule,
    SdkRatesModule,
    SharedModule,
  ],
  providers: [
    StripeFlowService,
    StripeCommonService,
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
  ],
})
export class StripeIdealInquiryModule {
  public resolveChoosePaymentStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
