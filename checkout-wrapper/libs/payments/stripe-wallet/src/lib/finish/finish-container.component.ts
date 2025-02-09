/// <reference types="stripe-v3" />
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { map, skipWhile, takeUntil, tap } from 'rxjs/operators';

import { AbstractFinishContainer, AbstractFinishContainerComponent } from '@pe/checkout/finish';
import {
  NodePaymentResponseInterface,
  PaymentStatusEnum,
  ResponseErrorsInterface,
} from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  PaymentIntentResponse,
  NodePaymentResponseDetailsInterface, StripeFlowService,
} from '../shared';

import StripePaymentRequest = stripe.paymentRequest.StripePaymentRequest;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-wallet-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
  providers: [PeDestroyService],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements AbstractFinishContainer {

  protected currencyPipe = inject(PeCurrencyPipe);
  private readonly stripeFlowService = inject(StripeFlowService);

  isCheckStatusProcessing: boolean;
  isCheckStatusTimeout: boolean;
  stripePaymentRequest: StripePaymentRequest;
  stripeError: string;

  public readonly confirmCardPaymentLoading$ = this.stripeFlowService.confirmCardPayment$.pipe(
    map((response: PaymentIntentResponse) => response?.inProgress )
  );

  // For payment widgets when we have many payments in flow but behava like only one
  @Input() allowBrowserCard: boolean;

  showFinishModalFromExistingPayment(): void {
    super.showFinishModalFromExistingPayment();

    if (this.paymentResponse.payment.status === PaymentStatusEnum.STATUS_NEW) {
      this.stripeFlowService.confirmCardPayment$.pipe(
        skipWhile((response: PaymentIntentResponse) => response?.inProgress),
        tap(() => this.runStatusCheck())
      ).subscribe();

    }
  }

  private runStatusCheck(): void {
    const start: number = Math.floor(Date.now());
    const delay: number = 3 * 1000;
    const timeout: number = 180 * 1000;

    this.isCheckStatusProcessing = true;
    this.isCheckStatusTimeout = false;
    this.cdr.markForCheck();

    let requesting = false;
    const sub: Subscription = interval(delay).subscribe(() => {
      if (requesting) {
        return; // Skip if request still processing during delay finished
      }
      requesting = true;
      this.nodeFlowService.updatePayment<NodePaymentResponseDetailsInterface>().pipe(
        takeUntil(this.destroy$)
      ).subscribe((nodePaymentResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>) => {
          this.paymentResponse = nodePaymentResponse;
          let done = false;
          if (this.paymentResponse.payment.status !== PaymentStatusEnum.STATUS_NEW) {
            done = true;
          } else if (Math.floor(Date.now()) > (start + timeout)) {
            this.isCheckStatusTimeout = true;
            done = true;
          }

          if (done) {
            this.isCheckStatusProcessing = false;
            this.cdr.markForCheck();
            sub.unsubscribe();
          }
          requesting = false;
        },
        (response: ResponseErrorsInterface) => {
          this.errors = response.errors;
          this.isCheckStatusProcessing = false;
          this.isCheckStatusTimeout = false;
          this.errorMessage = response.raw?.error?.message || response.message;
          requesting = false;
          this.cdr.markForCheck();
          sub.unsubscribe();
        });
    });
  }
}
