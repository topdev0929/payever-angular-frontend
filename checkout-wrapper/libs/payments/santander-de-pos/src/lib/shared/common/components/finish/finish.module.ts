import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { FinishModule as SDKFinishModule } from '@pe/checkout/finish';
import { UiModule } from '@pe/checkout/ui';
import { CheckoutUiQrBoxModule } from '@pe/checkout/ui/qr-box';

import {
  FinishComponent,
  FinishMerchantStatusPendingComponent,
  FinishStatusFailComponent,
  MerchantAdoptionComponent,
  MerchantStylesComponent,
  SelfAdoptionComponent,
} from './';

@NgModule({
  imports: [
    CommonModule,
    SDKFinishModule,
    UiModule,
    MatButtonModule,
    CheckoutUiQrBoxModule,
  ],
  declarations: [
    FinishComponent,
    FinishStatusFailComponent,
    SelfAdoptionComponent,
    FinishMerchantStatusPendingComponent,
    MerchantAdoptionComponent,
    MerchantStylesComponent,
  ],
  exports: [
    FinishComponent,
    FinishStatusFailComponent,
    SelfAdoptionComponent,
    FinishMerchantStatusPendingComponent,
    MerchantAdoptionComponent,
    MerchantStylesComponent,

    SDKFinishModule,
    UiModule,
    MatButtonModule,
  ],
})
export class SharedFinishModule {
}
