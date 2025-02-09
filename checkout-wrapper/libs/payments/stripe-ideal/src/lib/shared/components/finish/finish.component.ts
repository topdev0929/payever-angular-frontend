import {
  Component, ChangeDetectionStrategy, Input,
} from '@angular/core';

import { AbstractFinishTemplateComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { NodePaymentResponseDetailsInterface } from '../../types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-ideal-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishTemplateComponent {
  @Input() isCheckStatusTimeout = false;

  get translations() {
    return {
      processingTitle: $localize `:@@payment-stripe-ideal.inquiry.finish.processing.title:`,
      processingText: $localize `:@@payment-stripe-ideal.inquiry.finish.processing.text:`,
    };
  }

  isStatusSuccess(): boolean {
    return [
      PaymentStatusEnum.STATUS_ACCEPTED,
      PaymentStatusEnum.STATUS_PAID,
    ].indexOf(this.status) >= 0;
  }

  isStatusPending(): boolean {
    return [
      PaymentStatusEnum.STATUS_IN_PROCESS,
    ].indexOf(this.status) >= 0;
  }

  isStatusFail(): boolean {
    return [
      PaymentStatusEnum.STATUS_FAILED,
      PaymentStatusEnum.STATUS_DECLINED,
    ].indexOf(this.status) >= 0;
  }

  isStatusNew(): boolean {
    return [
      PaymentStatusEnum.STATUS_NEW,
    ].indexOf(this.status) >= 0;
  }

  getNodeResultDetails(): NodePaymentResponseDetailsInterface {
    return this.nodeResult.paymentDetails;
  }
}
