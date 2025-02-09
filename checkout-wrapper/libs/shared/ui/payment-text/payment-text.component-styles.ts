import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'pe-payment-text-styles',
  template: '',
  styles: [`
    .pe-checkout-bootstrap pe-payment-text .pe-payment-html p {
      margin: 0;
    }
    .pe-checkout-bootstrap pe-payment-text .pe-payment-html ul {
      padding-left: 10px;
      margin: 0;
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class PaymentTextStylesComponent {
}
