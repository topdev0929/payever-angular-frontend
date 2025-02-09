import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

import { CheckoutActionHandler, CheckoutState } from './checkout';
import { FlowActionHandler, FlowState } from './flow';
import { ParamsActionHandler, ParamsState } from './params';
import { PaymentActionHandler, PaymentState } from './payment';
import { SettingsActionHandler, SettingsState } from './settings';
import { StepsActionHandler, StepsState } from './steps';

@NgModule({
  imports: [
    CommonModule,

    NgxsModule.forFeature([
      CheckoutState,
      FlowState,
      ParamsState,
      PaymentState,
      SettingsState,
      StepsState,
    ]),
  ],
  exports: [
    NgxsModule,
  ],
})
export class StoreModule {
  constructor(
    private checkoutActionHandler: CheckoutActionHandler,
    private flowActionHandler: FlowActionHandler,
    private paramsActionHandler: ParamsActionHandler,
    private stepsActionHandler: StepsActionHandler,
    private paymentActionHandler: PaymentActionHandler,
    private settingsActionHandler: SettingsActionHandler,
  ) {}
}
