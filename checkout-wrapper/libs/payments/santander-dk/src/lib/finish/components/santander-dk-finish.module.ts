import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FinishModule } from '@pe/checkout/finish';
import { BasePaymentFinishModule, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { PluginsModule } from '@pe/checkout/plugins';
import { CheckoutUiQrBoxModule } from '@pe/checkout/ui/qr-box';
import { UtilsModule } from '@pe/checkout/utils';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS } from '../../settings';
import { SharedModule } from '../../shared';

import { FinishContainerComponent } from './finish-container';
import { FinishComponent } from './finish/finish.component';

@NgModule({
  declarations: [
    FinishComponent,
    FinishContainerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    FinishModule,
    PluginsModule,
    UtilsModule,
    CheckoutUiQrBoxModule,
    SharedModule,
  ],
  providers: [
    {
      provide: PAYMENT_SETTINGS,
      useValue: {
        addressSettings: BILLING_ADDRESS_SETTINGS,
        hasNodeOptions: HAS_NODE_FORM_OPTIONS,
      },
    },
  ],
})
export class SantanderDkFinishModule extends BasePaymentFinishModule {
  resolveFinishContainerComponent(): Type<FinishContainerComponent> {
    return FinishContainerComponent;
  }
}
