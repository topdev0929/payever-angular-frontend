import { NgIf } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractFinishComponent, FinishModule } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';

@Component({
  selector: 'pe-santander-at-finish-view',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,

    FinishModule,
  ],
})
export class FinishComponent extends AbstractFinishComponent {

  override isStatusSuccess(): boolean {
    return [
      PaymentStatusEnum.STATUS_ACCEPTED,
      PaymentStatusEnum.STATUS_PAID,
    ].indexOf(this.status) >= 0;
  }

  override isStatusPending(): boolean {
    return [
      PaymentStatusEnum.STATUS_NEW, // Not correct but sometimes they return it instead of STATUS_IN_PROCESS
      PaymentStatusEnum.STATUS_IN_PROCESS,
    ].indexOf(this.status) >= 0;
  }

  override isStatusFail(): boolean {
    return [
      PaymentStatusEnum.STATUS_FAILED,
      PaymentStatusEnum.STATUS_DECLINED,
    ].indexOf(this.status) >= 0;
  }
}
