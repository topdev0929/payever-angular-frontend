import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { CheckoutWindow, CheckoutSettingsInterface } from '@pe/checkout/types';

import { InitSettings } from './settings.actions';

@Injectable({
  providedIn: 'root',
})
export class SettingsActionHandler {
  private readonly loader = (window as CheckoutWindow).pe_pageCheckoutLoader;


  constructor(
    private store: Store,
  ) {
    if (this.loader?.checkoutData) {
      this.store.dispatch(new InitSettings(this.loader.checkoutData));
    } else if (this.loader) {
      this.loader.successCallback = (data: CheckoutSettingsInterface) => {
        this.store.dispatch(new InitSettings(data));
      };
    }
  }
}
