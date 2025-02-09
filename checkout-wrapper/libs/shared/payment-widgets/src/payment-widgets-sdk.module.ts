import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { ResizeDirective } from '@pe/checkout/utils/from-resize-observer';

import {
  UICardComponent,
  UICardStyleComponent,
  UIFooterPoweredByPayeverComponent,
  UIFullHeaderSantanderComponent,
  UIHeaderSantanderComponent,
  UILoadingRatesComponent,
  UIPayeverIconComponent,
  UIRateButtonComponent,
  UIRateDropdownComponent,
  UIRateTextComponent,
  UIRateErrorComponent,
  UIRegularTextComponent,
  UIPoweredByPayeverComponent,
  UISantanderIconShortComponent,
  UISelectedRateDetailsComponent,
  UIShortHeaderSantanderComponent,
  UIShowCheckoutWrapperButtonComponent,
  UITopTextComponent,
  UITopBigTextComponent,
  UISelectedRateDetailsLineComponent,
  UISantanderIconMediumComponent,
  UISantanderConsumerIconMediumComponent,
  UIRateDropdownStyleComponent,
  UIShadowRootWrapperComponent,
  UIZiniaIconComponent,
} from './components/ui';
import { CheckoutApiService, IconsHelperService } from './services';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatMenuModule,
    MatDialogModule,
    MatIconModule,
    ResizeDirective,
  ],
  exports: [
    MatIconModule,
    UICardComponent,
    UIFooterPoweredByPayeverComponent,
    UIFullHeaderSantanderComponent,
    UIHeaderSantanderComponent,
    UILoadingRatesComponent,
    UIPayeverIconComponent,
    UIRateButtonComponent,
    UIRateDropdownComponent,
    UIRateTextComponent,
    UIRateErrorComponent,
    UIRegularTextComponent,
    UIPoweredByPayeverComponent,
    UISantanderIconShortComponent,
    UISantanderIconMediumComponent,
    UISantanderConsumerIconMediumComponent,
    UISelectedRateDetailsComponent,
    UISelectedRateDetailsLineComponent,
    UIShortHeaderSantanderComponent,
    UIShowCheckoutWrapperButtonComponent,
    UITopTextComponent,
    UITopBigTextComponent,
    UIShadowRootWrapperComponent,
    UIZiniaIconComponent,
  ],
  declarations: [
    UICardComponent,
    UICardStyleComponent,
    UIFooterPoweredByPayeverComponent,
    UIFullHeaderSantanderComponent,
    UIHeaderSantanderComponent,
    UILoadingRatesComponent,
    UIPayeverIconComponent,
    UIRateButtonComponent,
    UIRateDropdownStyleComponent,
    UIRateDropdownComponent,
    UIRateTextComponent,
    UIRateErrorComponent,
    UIRegularTextComponent,
    UIPoweredByPayeverComponent,
    UISantanderIconShortComponent,
    UISantanderIconMediumComponent,
    UISantanderConsumerIconMediumComponent,
    UISelectedRateDetailsComponent,
    UISelectedRateDetailsLineComponent,
    UIShortHeaderSantanderComponent,
    UIShowCheckoutWrapperButtonComponent,
    UITopTextComponent,
    UITopBigTextComponent,
    UIShadowRootWrapperComponent,
    UIZiniaIconComponent,
  ],
  providers: [
    CurrencyPipe,
    PercentPipe,
    IconsHelperService,
    CheckoutApiService,
  ],
})
export class PaymentWidgetsSdkModule {
}
