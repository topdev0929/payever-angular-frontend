import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { ViewerCheckoutComponent } from './components/checkout/viewer-checkout.component';

import { NewCartService } from './services/cart.service';
import { CheckoutApiService } from './services/checkout-api.service';
import { NewCheckoutService } from './services/checkout.service';

@NgModule({
  declarations: [ViewerCheckoutComponent],
  exports: [ViewerCheckoutComponent],
  imports: [CommonModule],
  providers: [
    AuthService,
  ],
})
export class CheckoutModule {
  static forRoot(): ModuleWithProviders<CheckoutModule> {
    return {
      ngModule: CheckoutModule,
      providers: [
        NewCartService,
        CheckoutApiService,
        NewCheckoutService,
      ],
    };
  }
}
