import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';

import { NodePaymentDetailsResponseInterface } from '../../types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'wiretransfer-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishComponent {

  get paymentDetails(): NodePaymentDetailsResponseInterface {
    return this.nodeResult?.paymentDetails;
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
}
