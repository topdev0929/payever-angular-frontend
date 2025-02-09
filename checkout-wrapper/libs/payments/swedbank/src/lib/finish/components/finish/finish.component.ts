import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { AbstractFinishTemplateComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { NodePaymentDetailsResponseInterface } from '../../../shared/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'swedbank-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishTemplateComponent {
  @Input() showTemplate: boolean;

  isNewStatus(): boolean {
    return this.status === PaymentStatusEnum.STATUS_NEW;
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

  getNodeResultDetails(): NodePaymentDetailsResponseInterface {
    return this.nodeResult.paymentDetails;
  }
}
