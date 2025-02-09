import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { tap } from 'rxjs/operators';

import {
  AbstractFinishContainer,
  AbstractFinishContainerComponent,
} from '@pe/checkout/finish';

import {
  NodePaymentDetailsResponseInterface,
} from '../shared';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-direct-debit-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements AbstractFinishContainer, OnInit {

  updateStatus(): void {
    this.paymentResponse = null;
    this.errorMessage = null;
    this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().pipe(
      tap((payment) => {
        this.paymentResponse = payment;
        this.cdr.markForCheck();
      }, (err) => {
        this.errorMessage = err.message;
        this.cdr.markForCheck();
      }),
    ).subscribe();
  }
}
