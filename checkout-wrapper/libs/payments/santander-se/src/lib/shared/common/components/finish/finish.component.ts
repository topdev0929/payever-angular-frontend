import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { AbstractFinishComponent, ModalButtonListInterface } from '@pe/checkout/finish';
import { PaymentState } from '@pe/checkout/store';
import { PaymentSpecificStatusEnum, PaymentStatusEnum, ResponseErrorsInterface } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';

import { MobileSigningStatusesEnum } from '../../../enums';
import { SantanderSePaymentStateService } from '../../services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-se-shared-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishComponent implements OnInit {
  @SelectSnapshot(PaymentState.error) error: ResponseErrorsInterface;

  @Output() startSigning: EventEmitter<void> = new EventEmitter();

  buttons$: Observable<ModalButtonListInterface>;

  paymentStateService = this.injector.get(SantanderSePaymentStateService);
  customElementService = this.injector.get(CustomElementService);
  store = this.injector.get(Store);

  isWaiting$ = this.paymentStateService.isWaitingForSignUrl$.pipe(
    withLatestFrom(this.store.selectOnce(PaymentState.error)),
    map(([isWaiting, error]) => isWaiting && !error)
  );

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['bankid'],
      null,
      this.customElementService.shadowRoot
    );
    this.buttons$ = combineLatest([
      this.paymentStateService.isCheckStatusProcessing$,
      this.paymentStateService.isReadyForStartSigning$,
    ]).pipe(
      map(
        ([isCheckStatusProcessing, isReadyForStartSigning]) =>
          isCheckStatusProcessing || isReadyForStartSigning ? null : this.buttons
      )
    );
  }

  isSigning(): boolean {
    return (this.paymentStateService.isCheckStatusProcessing$.value
      || this.paymentStateService.isReadyForStartSigning$.value
      || !this.nodeResult?.paymentDetails?.mobileSigningStatus
      || this.nodeResult?.paymentDetails?.mobileSigningStatus === MobileSigningStatusesEnum.Rejected)
      && !(
        this.status === PaymentStatusEnum.STATUS_FAILED
        || this.status === PaymentStatusEnum.STATUS_DECLINED
        || this.status === PaymentStatusEnum.STATUS_PAID
        || this.specificStatus === PaymentSpecificStatusEnum.STATUS_ACTIVATED
        || this.nodeResult?.paymentDetails?.mobileSigningStatus === MobileSigningStatusesEnum.Completed
      );
  }

  isStatusSuccess(): boolean {
    return !this.isSigning() && super.isStatusSuccess() && !this.paymentStateService.isUpdatePaymentTimeout$.value;
  }

  isStatusPending(): boolean {
    return !this.isSigning() && super.isStatusPending();
  }

  isStatusFail(): boolean {
    return !this.isSigning() && (super.isStatusFail() || this.paymentStateService.isUpdatePaymentTimeout$.value);
  }

  onStartSigning(): void {
    this.startSigning.emit();
  }
}
