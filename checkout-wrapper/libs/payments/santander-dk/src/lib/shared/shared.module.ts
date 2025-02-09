import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { DialogModule } from '@pe/checkout/dialog';
import { FormUtilsModule as SdkFormUtilsModule } from '@pe/checkout/form-utils';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PluginsModule as SdkPluginsModule } from '@pe/checkout/plugins';
import { UtilsModule } from '@pe/checkout/utils';
import { POLLING_CONFIG } from '@pe/checkout/utils/poll';

import { DK_POLLING_CONFIG } from '../settings';

import {
  AcceptBusinessTermsDialogComponent,
  MarketingConsentDialogComponent,
  UISelectedRateDetailsComponent,
} from './components';
import {
  PaymentService,
  ProductsCalculationService,
  RatesCalculationApiService,
  RatesCalculationService,
  SantanderDkApiService,
  SantanderDkFlowService,
} from './services';

@NgModule({
  declarations: [
    AcceptBusinessTermsDialogComponent,
    MarketingConsentDialogComponent,
    UISelectedRateDetailsComponent,
  ],
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatButtonModule,
    DialogModule,
    UtilsModule,
    SdkFormUtilsModule,
    SdkPluginsModule,
  ],
  exports: [
    SdkFormUtilsModule,

    AcceptBusinessTermsDialogComponent,
    MarketingConsentDialogComponent,
    UISelectedRateDetailsComponent,
  ],
  providers: [
    RatesCalculationApiService,
    RatesCalculationService,
    ProductsCalculationService,
    SantanderDkApiService,
    SantanderDkFlowService,
    // It is important to provide ErrorBag in shared module so both
    // rates form and inquiry form share same error bag
    {
      provide: POLLING_CONFIG,
      useValue: DK_POLLING_CONFIG,
    },
    {
      provide: ABSTRACT_PAYMENT_SERVICE,
      useClass: PaymentService,
    },
  ],
})
export class SharedModule {}
