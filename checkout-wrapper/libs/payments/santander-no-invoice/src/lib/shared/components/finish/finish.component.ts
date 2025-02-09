import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-invoice-no-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishComponent {

  isStatusSuccess(): boolean {
    return (
      this.status === PaymentStatusEnum.STATUS_ACCEPTED ||
      // this.status === PaymentStatusEnum.STATUS_NEW ||
      // this.status === PaymentStatusEnum.STATUS_PAID ||
      // this.status === PaymentStatusEnum.STATUS_REFUNDED ||
      (this.status === PaymentStatusEnum.STATUS_IN_PROCESS && !this.hasPendingUrl())
    );
  }

  isStatusPending(): boolean {
    return (
      this.status === PaymentStatusEnum.STATUS_IN_PROCESS && this.hasPendingUrl()
    );
  }

  isStatusFail(): boolean {
    return (
      this.status === PaymentStatusEnum.STATUS_FAILED ||
      this.status === PaymentStatusEnum.STATUS_DECLINED
      // this.status === PaymentStatusEnum.STATUS_CANCELLED
    );
  }

  private hasPendingUrl(): boolean {
    return !!(this.payment?.apiCall?.pendingUrl);
  }
}
