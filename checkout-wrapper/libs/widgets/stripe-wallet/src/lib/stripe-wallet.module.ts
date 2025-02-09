import { NgModule } from '@angular/core';

import { AbstractBaseWidgetModule } from '@pe/checkout/payment-widgets';

import { StripeWalletComponent } from './components';

@NgModule({
})
export class StripeWalletModule extends AbstractBaseWidgetModule {
  public resolveComponent() {
    return StripeWalletComponent;
  }
}
