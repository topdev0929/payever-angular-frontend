import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-be-shared-finish',
  templateUrl: './finish.component.html',
})
export class FinishComponent extends AbstractFinishComponent {

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

  isStatusNew(): boolean {
    return [
      PaymentStatusEnum.STATUS_NEW,
    ].indexOf(this.status) >= 0;
  }

  isStatusFail(): boolean {
    return [
      PaymentStatusEnum.STATUS_FAILED,
      PaymentStatusEnum.STATUS_DECLINED,
    ].indexOf(this.status) >= 0;
  }
}
