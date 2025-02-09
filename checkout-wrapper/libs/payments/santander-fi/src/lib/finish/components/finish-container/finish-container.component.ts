import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';

import { NodePaymentDetailsResponseInterface } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-fi-finish-container',
  templateUrl: './finish-container.component.html',
  styleUrls: ['./finish-container.component.scss'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements OnInit {

  showFinishModalFromExistingPayment(): void {
    this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().subscribe((payment) => {
      this.paymentResponse = payment;
      this.cdr.markForCheck();
    }, (err) => {
      this.errorMessage = err.message || 'Unknown error';
      this.cdr.markForCheck();
    });
  }
}
