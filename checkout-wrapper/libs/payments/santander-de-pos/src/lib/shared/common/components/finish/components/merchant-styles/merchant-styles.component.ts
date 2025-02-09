import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'santander-de-pos-merchant-adoption-styles',
  template: '',
  styles: [`
    .pe-checkout-bootstrap santander-de-pos-merchant-adoption .disable-contract  a {
      cursor: not-allowed;
    }
    .pe-checkout-bootstrap santander-de-pos-merchant-adoption a {
      color: rgba(18, 18, 18, 0.85);
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class MerchantStylesComponent {
}
