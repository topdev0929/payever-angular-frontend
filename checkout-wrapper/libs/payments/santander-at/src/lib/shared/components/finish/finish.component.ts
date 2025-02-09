import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-at-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
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
      PaymentStatusEnum.STATUS_NEW, // Not correct but sometimes they return it instead of STATUS_IN_PROCESS
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
