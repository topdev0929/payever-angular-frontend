import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';

import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import { PeDestroyService } from '@pe/destroy';


@Component({
  selector: 'santander-de-invoice-payment-details',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PaymentDetailsContainerComponent
  extends AbstractPaymentContainerComponent
  implements OnInit {

  @Output() continue = new EventEmitter<void>();

  ngOnInit(): void {
    this.continue.next();
  }
}
