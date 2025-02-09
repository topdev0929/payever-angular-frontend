import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { AbstractFinishContainer, AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { NodePaymentResponseDetailsInterface } from '../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-be-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements AbstractFinishContainer {
    isNeedUpdating = true;

    @Input() asSinglePayment = false;

    private errorTranslates = {
      unknown: $localize `:@@payment-santander-be.errors.unknown:`,
      redirectEmpty: $localize `:@@payment-santander-be.errors.redirect_empty:`,
    };

    showFinishModalFromExistingPayment(): void {
      this.nodeFlowService.pollPaymentUntilStatus<NodePaymentResponseDetailsInterface>(
        PaymentStatusEnum.STATUS_NEW,
      ).subscribe(() => {
        this.paymentResponse = this.nodeFlowService.getFinalResponse<NodePaymentResponseDetailsInterface>();
        this.cdr.detectChanges();
      }, (err) => {
        this.errorMessage = err.message || this.errorTranslates.unknown;
        this.cdr.detectChanges();
      });
    }
}
