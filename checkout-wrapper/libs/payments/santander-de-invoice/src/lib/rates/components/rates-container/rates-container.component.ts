import {
  ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AbstractPaymentContainerComponent, PaymentSubmissionService } from '@pe/checkout/payment';
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
export class RatesContainerComponent extends AbstractPaymentContainerComponent implements OnInit {

  isSendingPayment = false;

  isThreatMetrixReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  protected currencyPipe = this.injector.get(PeCurrencyPipe);
  protected threatMetrixService = this.injector.get(ThreatMetrixService);
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
        () => {
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

    this.nodeFlowService.assignPaymentDetails({
      // Filling AdditionalPaymentDetailsInterface
      shopUserSession: this.flow.shopUserSession,
      riskSessionId: this.threatMetrixService.getLastRiskId(this.flow.id, this.paymentMethod),
    });

    this.continue.next();
  }
}
