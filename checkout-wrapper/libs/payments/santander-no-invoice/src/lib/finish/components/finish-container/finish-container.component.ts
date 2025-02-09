import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';

import { NodePaymentResponseDetailsInterface } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-invoice-no-finish-container',
  templateUrl: './finish-container.component.html',
  styleUrls: ['./finish-container.component.scss'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent {

  showFinishModalFromExistingPayment(): void {
    this.paymentResponse = this.nodeFlowService.getFinalResponse<NodePaymentResponseDetailsInterface>();
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
    this.cdr.markForCheck();
  }
}
