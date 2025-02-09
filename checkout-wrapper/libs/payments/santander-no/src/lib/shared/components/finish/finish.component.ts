import { Component, ChangeDetectionStrategy } from '@angular/core';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum, PaymentSpecificStatusEnum } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-no-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishComponent {

  get successLink(): string {
    return this.nodeResult.paymentDetails.applicantSignReferenceUrl;
  }

  get isShowApproved(): boolean {
    return this.status === PaymentStatusEnum.STATUS_IN_PROCESS &&
      this.specificStatus === PaymentSpecificStatusEnum.STATUS_APPROVED;
  }

  get isNeedMoreInfo(): boolean {
    return this.specificStatus === PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO ||
      this.specificStatus === PaymentSpecificStatusEnum.NEED_MORE_INFO_DTI ||
      this.specificStatus === PaymentSpecificStatusEnum.NEED_MORE_INFO_IIR;
  }

  isStatusSuccess(): boolean {
    return !this.isNeedMoreInfo && (
      this.status === PaymentStatusEnum.STATUS_ACCEPTED ||
      this.status === PaymentStatusEnum.STATUS_PAID
    );
  }

  isStatusPending(): boolean {
    return !this.isNeedMoreInfo && (
      this.status === PaymentStatusEnum.STATUS_IN_PROCESS
    );
  }

  isStatusFail(): boolean {
    return !this.isNeedMoreInfo && (
      this.status === PaymentStatusEnum.STATUS_FAILED ||
      this.status === PaymentStatusEnum.STATUS_DECLINED
    );
  }

  isValidUrl(value: string): boolean {
    try {
      return value && !!new URL(value);
    } catch (err) {
      return false;
    }
  }

  handleLinkClick(): void {
    window.location.href = this.successLink;
  }
}
