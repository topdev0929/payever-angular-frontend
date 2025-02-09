import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';

import { AbstractPaymentDetailsContainerInterface } from '@pe/checkout/payment';

import { BaseContainerComponent } from '../shared';


@Component({
  selector: 'zinia-bnpl-payment-details-container',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailsContainerComponent
  extends BaseContainerComponent
  implements AbstractPaymentDetailsContainerInterface, OnInit {
  @Output() continue = new EventEmitter<void>();

  ngOnInit(): void {
    this.continue.emit();
  }
}
