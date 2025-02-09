import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';

import { AbstractFinishComponent, FinishDialogService } from '@pe/checkout/finish';
import { SetPaymentComplete } from '@pe/checkout/store';
import { PaymentStatusEnum } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';

import { TermsService } from '../../services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'zinia-bnpl-finish-v4',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
})
export class FinishComponent extends AbstractFinishComponent implements OnInit {

  private readonly termsService = inject(TermsService);
  private readonly store = inject(Store);
  private readonly finishDialogService = inject(FinishDialogService);
  private readonly customElementService = inject(CustomElementService);

  @Input() isStatusTimeout = false;

  @Input() otpStatus: { status: string, code?: string };

  @Output() otpCodeReady = new EventEmitter<any>();

  protected readonly consents$ = this.termsService.getTerms(this.flow.id).pipe(
    map(({ consents }) => consents),
  );

  ngOnInit(): void {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['close-16'],
      null,
      this.customElementService.shadowRoot
    );
  }

  isOtpVerify(): boolean {
    return [
      PaymentStatusEnum.STATUS_IN_PROCESS,
    ].indexOf(this.status) >= 0 && !!this.nodeResult.paymentDetails?.verifyValue;
  }

  isStatusSuccess(): boolean {
    return [
      PaymentStatusEnum.STATUS_ACCEPTED,
      PaymentStatusEnum.STATUS_PAID,
    ].indexOf(this.status) >= 0 && !this.isOtpVerify();
  }

  isStatusPending(): boolean {
    return this.isStatusTimeout || [
      PaymentStatusEnum.STATUS_IN_PROCESS,
    ].indexOf(this.status) >= 0 && !this.isOtpVerify();
  }

  isStatusFail(): boolean {
    return [
      PaymentStatusEnum.STATUS_FAILED,
      PaymentStatusEnum.STATUS_DECLINED,
    ].indexOf(this.status) >= 0;
  }

  isStatusUnknown(): boolean {
    return super.isStatusUnknown() && !this.isOtpVerify();
  }

  closeOtp() {
    this.finishDialogService.close();
    this.store.dispatch(new SetPaymentComplete(false));
    this.paymentHelperService.setPaymentLoading(false);
  }
}
