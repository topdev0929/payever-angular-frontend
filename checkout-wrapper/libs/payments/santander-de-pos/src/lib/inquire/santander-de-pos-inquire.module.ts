import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { FormUtilsModule, LAZY_PAYMENT_SECTIONS } from '@pe/checkout/form-utils';
import {
  ABSTRACT_PAYMENT_SERVICE,
  BasePaymentDetailsModuleInterface,
  BasePaymentModule,
  PAYMENT_SETTINGS,
} from '@pe/checkout/payment';
import {
  DocsManagerService,
  FormConfigService,
  LAZY_PAYMENT_SECTIONS_DE_POS,
  PaymentService,
  docsManagerServiceFactory,
} from '@pe/checkout/santander-de-pos/shared';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';

import { InquiryContainerComponent } from './inquire-container.component';

@NgModule({
  declarations: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FormUtilsModule,
  ],
  exports: [
    InquiryContainerComponent,
  ],
  providers: [
    FormConfigService,
    {
      provide: DocsManagerService,
      useFactory: docsManagerServiceFactory,
    },
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
    {
      provide: LAZY_PAYMENT_SECTIONS,
      useValue: LAZY_PAYMENT_SECTIONS_DE_POS,
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
export class SantanderDePosInquireModule extends BasePaymentModule implements BasePaymentDetailsModuleInterface {

  public resolvePaymentDetailsStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}
