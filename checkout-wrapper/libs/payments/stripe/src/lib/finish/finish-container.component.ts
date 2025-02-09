import {
  ChangeDetectionStrategy, Component, OnInit,
} from '@angular/core';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';

import {
  NodePaymentDetailsResponseInterface,
} from '../shared/types';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent implements OnInit {

  updateStatus(): void {
    this.paymentResponse = null;
    this.errorMessage = null;
    this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().subscribe((payment) => {
      this.paymentResponse = payment;
      this.cdr.markForCheck();
    }, (err) => {
      this.errorMessage = err.message;
      this.cdr.markForCheck();
    });
  }
}
