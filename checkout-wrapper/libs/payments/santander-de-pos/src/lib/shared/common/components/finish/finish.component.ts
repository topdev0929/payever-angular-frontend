import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-pos-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishComponent {
  @Input() isEditMode = false;

  @Output() changeContainerHeight = new EventEmitter<number>();

  @ViewChild('finishContainer', { static: true }) finishContainerRef: ElementRef<HTMLDivElement>;

  resizeObserver: ResizeObserver;

  isVerificationModalRequired(): boolean {
    return this.specificStatus === PaymentSpecificStatusEnum.STATUS_GENEHMIGT ||
           (this.specificStatus === PaymentSpecificStatusEnum.STATUS_IN_ENTSCHEIDUNG && !this.merchantMode) ||
           (this.specificStatus === PaymentSpecificStatusEnum.STATUS_ZURUECKGESTELLT && !this.merchantMode) ||
           this.specificStatus === PaymentSpecificStatusEnum.STATUS_SIGNED ||
           this.specificStatus === PaymentSpecificStatusEnum.STATUS_VERIFIED;
  }

  isCustomStatusSuccess(): boolean {
    return [
      PaymentStatusEnum.STATUS_ACCEPTED,
      PaymentStatusEnum.STATUS_PAID,
    ].indexOf(this.status) >= 0 && !this.isVerificationModalRequired();
  }

  isMerchantStatusPending(): boolean {
    return this.merchantMode && [
      PaymentStatusEnum.STATUS_IN_PROCESS,
    ].indexOf(this.status) >= 0 && !this.isVerificationModalRequired();
  }

  isSelfTerminalStatusPending(): boolean {
    return !this.merchantMode && [
      PaymentSpecificStatusEnum.STATUS_IN_BEARBEITUNG,
    ].indexOf(this.specificStatus) >= 0;
  }

  getIframeCallbackUrl(): string {
    // As we are in pos we don't need to call callback urls
    // But if some day it will be needed - we will have to reorganize logic to
    // return true for isStatusSuccess() and isStatusPending() only when verification is passed.
    return null;
  }

  isCustomStatusFail(): boolean {
    return [
      PaymentStatusEnum.STATUS_FAILED,
      PaymentStatusEnum.STATUS_DECLINED,
      PaymentStatusEnum.STATUS_CANCELLED,
    ].indexOf(this.status) >= 0 && !this.isVerificationModalRequired();
  }
}
