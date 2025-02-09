import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { NodePaymentDetailsResponseInterface } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-nl-finish-container',
  templateUrl: './finish-container.component.html',
  styleUrls: ['./finish-container.component.scss'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements OnInit {

  protected externalRedirectStorage = this.injector.get(ExternalRedirectStorage);

  showFinishModalFromExistingPayment(): void {
    this.nodeFlowService.pollPaymentUntilStatus<NodePaymentDetailsResponseInterface>(
      PaymentStatusEnum.STATUS_NEW,
    ).subscribe((payment) => {
      this.paymentResponse = this.nodeFlowService.getFinalResponse<NodePaymentDetailsResponseInterface>();
      this.cdr.detectChanges();
    }, (err) => {
      this.errorMessage = err.message || 'Unknown error';
      this.cdr.detectChanges();
    });
  }
}
