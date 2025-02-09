import {
  ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output,
} from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { AbstractContainerComponent, PaymentSubmissionService } from '@pe/checkout/payment';
import { ThreatMetrixService } from '@pe/checkout/tmetrix';
import {
  ChangePaymentDataInterface,
  TimestampEvent,
} from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { prepareData } from '@pe/checkout/utils/prepare-data';
import { PeDestroyService } from '@pe/destroy';

import {
  FormInterface,
  NodePaymentDetailsInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-invoice-de-rates-container',
  templateUrl: './rates-container.component.html',
  providers: [PeDestroyService],
})
export class RatesContainerComponent extends AbstractContainerComponent implements OnInit {

  isSendingPayment = false;

  isThreatMetrixReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  private currencyPipe = this.injector.get(PeCurrencyPipe);
  private threatMetrixService = this.injector.get(ThreatMetrixService);
  private apiService = this.injector.get(ApiService);
  private submit$ = this.injector.get(PaymentSubmissionService);

  ngOnInit(): void {
    this.isThreatMetrixReady$.next(true);
    this.threatMetrixService.nodeInitFor(
      this.flow.id,
      this.flow.connectionId,
      this.paymentMethod,
    ).pipe(
      tap(
        () => {
          this.isThreatMetrixReady$.next(true);
        },
        (err) => {
          this.isThreatMetrixReady$.next(true);
          throw new Error('Cant load tmetrix!');
        },
      ),
    ).subscribe();

    this.analyticsFormService.initPaymentMethod(this.paymentMethod);

    const total = this.currencyPipe.transform(this.flow.total, this.flow.currency, 'symbol', '1.2-2');
    this.buttonText.next(
      $localize`:@@santander-de-invoice.action.buy_now_for_total:${total}:total:`,
    );
  }

  onSend(formData: FormInterface): void {
    this.sendPaymentData(formData);
  }

  triggerSubmit(): void {
    this.submit$.next();
  }

  protected sendPaymentData(formData: FormInterface): void {

    if (!this.paymentOption) {
      throw new Error(`Payment method not presented in list! ${this.flow.paymentOptions}`);
    }

    const data: NodePaymentDetailsInterface = prepareData(formData);

    const salutation = data.personalSalutation || this.flow.billingAddress?.salutation;
    const phone = data.phone || this.flow.billingAddress?.phone;

    delete data.personalSalutation;

    this.nodeFlowService.assignPaymentDetails({ address: { salutation, phone } });
    this.nodeFlowService.setPaymentDetails(data);

    this.postPayment();
  }

  protected postPayment(): void {

    if (this.isSendingPayment) {
      // To prevent double submit in some browsers
      return;
    }

    this.apiService.getChannelSetDeviceSettings(this.flow.channelSetId).pipe(
      catchError(() => of(null)),
      tap((paymentCodeSettings) => {
        this.nodeFlowService.assignPaymentDetails({
          // Filling AdditionalPaymentDetailsInterface
          shopUserSession: this.flow.shopUserSession,
          riskSessionId: this.threatMetrixService.getLastRiskId(this.flow.id, this.paymentMethod),
          posMerchantMode: this.merchantMode || this.flow.pos_merchant_mode,
          posVerifyType: paymentCodeSettings?.enabled ? paymentCodeSettings.verificationType : undefined,
        });

        this.continue.next();
      }),
    ).subscribe();
  }
}
