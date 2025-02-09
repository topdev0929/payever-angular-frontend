import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild,
  NgZone,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, first, skipWhile, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AbstractFinishComponent } from '@pe/checkout/finish';
import { PaymentStatusEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { NodePaymentDetailsResponseInterface } from '../../types';

const SPECIFIC_STATUS_BANK_VERIFY: any = 'requires_action';
const BANK_VERIFY_COMPLETE_EVENT = 'StripeCreditCardVerifyCompleted';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
  providers: [PeDestroyService],
})
export class FinishComponent extends AbstractFinishComponent implements AfterViewInit {

  @ViewChild('iframe', { static: false }) iframe: ElementRef;
  @Output() updateStatus: EventEmitter<void> = new EventEmitter();

  private destroy$ = this.injector.get(PeDestroyService);
  private ngZone = this.injector.get(NgZone);

  ngAfterViewInit(): void {
    this.ngZone.onStable.pipe(
      skipWhile(() => !this.isBankIframe),
      first(),
      switchMap(() => fromEvent(window, 'message').pipe(
        filter((e: any) => e?.data?.['event'] === BANK_VERIFY_COMPLETE_EVENT),
        tap(() => this.updateStatus.next())
      )),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  isStatusSuccess(): boolean {
    return [
      PaymentStatusEnum.STATUS_ACCEPTED,
      PaymentStatusEnum.STATUS_PAID,
    ].indexOf(this.status) >= 0;
  }

  isStatusPending(): boolean {
    return !this.isBankIframe && [
      PaymentStatusEnum.STATUS_IN_PROCESS,
    ].indexOf(this.status) >= 0;
  }

  isStatusFail(): boolean {
    return [
      PaymentStatusEnum.STATUS_FAILED,
      PaymentStatusEnum.STATUS_DECLINED,
    ].indexOf(this.status) >= 0;
  }

  get isBankIframe(): boolean {
    return this.nodeResult && this.status === PaymentStatusEnum.STATUS_IN_PROCESS &&
           this.specificStatus === SPECIFIC_STATUS_BANK_VERIFY &&
           this.getNodeResultDetails() && !!this.getNodeResultDetails().verifyUrl;
  }

  getNodeResultDetails(): NodePaymentDetailsResponseInterface {
    return this.nodeResult.paymentDetails;
  }
}
