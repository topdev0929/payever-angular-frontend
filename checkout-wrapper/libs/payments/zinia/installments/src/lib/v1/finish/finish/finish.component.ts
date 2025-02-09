import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'zinia-finish-v1',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishComponent {

  @Input() isStatusTimeout = false;

  override isStatusSuccess(): boolean {
    return [
      PaymentStatusEnum.STATUS_ACCEPTED,
      PaymentStatusEnum.STATUS_PAID,
    ].indexOf(this.status) >= 0;
  }

  override isStatusFail(): boolean {
    return super.isStatusFail() || [
      PaymentStatusEnum.STATUS_CANCELLED,
    ].indexOf(this.status) >= 0;
  }

  override isStatusPending(): boolean {
    return this.isStatusTimeout || [
      PaymentStatusEnum.STATUS_IN_PROCESS,
      PaymentStatusEnum.STATUS_NEW,
    ].indexOf(this.status) >= 0;
  }
}
