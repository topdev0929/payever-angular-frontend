import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';


import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { DialogModule as NgKitDialogModule } from '@pe/checkout/dialog';
import { FinishModule as SdkFinishModule } from '@pe/checkout/finish';
import { LAZY_PAYMENT_SECTIONS, FormUtilsModule as SdkFormUtilsModule } from '@pe/checkout/form-utils';
import { BasePaymentDetailsModule, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { RatesModule as SdkRatesModule } from '@pe/checkout/rates';
import { StorageModule as SdkStorageModule } from '@pe/checkout/storage';
import { UiModule as SdkUiModule } from '@pe/checkout/ui';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { UtilsModule } from '@pe/checkout/utils';
import { DEFAULT_POLLING_CONFIG, POLLING_CONFIG } from '@pe/checkout/utils/poll';

import { UtilStepService } from '../services';
import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../settings';
import {
  FormConfigService,
  LAZY_PAYMENT_SECTIONS_SE,
  SantanderSeApiService,
  SantanderSeFlowService,
  SharedModule,
  SantanderSePaymentProcessService,
} from '../shared';

import { InquiryContainerComponent } from './components';


@NgModule({
  declarations: [
    InquiryContainerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,

    SdkRatesModule,
    SdkStorageModule,
    SdkUiModule,
    NgKitDialogModule,
    PaymentTextModule,
    SdkFinishModule,
    SdkFormUtilsModule,
    UtilsModule,
    SharedModule,
  ],
  providers: [
    SantanderSeFlowService,
    SantanderSeApiService,
    FormConfigService,
    UtilStepService,
    SantanderSePaymentProcessService,
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
      provide: LAZY_PAYMENT_SECTIONS,
      useValue: LAZY_PAYMENT_SECTIONS_SE,
    },
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_PAYMENT_DETAILS',
      },
    },
  ],
})
export class SantanderSeInquiryModule extends BasePaymentDetailsModule {
  public resolvePaymentDetailsStepContainerComponent(): Type<InquiryContainerComponent> {
    return InquiryContainerComponent;
  }
}

