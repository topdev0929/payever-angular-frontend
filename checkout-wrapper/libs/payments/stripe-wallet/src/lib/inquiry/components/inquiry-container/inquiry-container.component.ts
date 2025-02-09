/// <reference types="stripe-v3" />
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, Subject, combineLatest } from 'rxjs';

import { StorageService } from '@pe/checkout/storage';
import { PaymentState, SettingsState } from '@pe/checkout/store';
import {
  CheckoutBaseSettingsInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  TimestampEvent,
} from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  NodePaymentResponseDetailsInterface,
  StripeFlowService,
} from '../../../shared';

import StripePaymentRequest = stripe.paymentRequest.StripePaymentRequest;
import IStripe = stripe.Stripe;

const DEFAULT_BUSINESS_COUNTRY = 'EN';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-wallet-inquiry-container',
  templateUrl: './inquiry-container.component.html',
  providers: [PeDestroyService],
})
export class InquiryContainerComponent extends BaseContainerComponent implements OnInit {

  @SelectSnapshot(SettingsState.baseSettings) private readonly settings: CheckoutBaseSettingsInterface;

  isSendingPayment = false;
  isShowingWallet = false;
  finishModalErrorMessage: string;
  nodeResult: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>;

  stripeError: string = null;
  doSubmit$: Subject<void> = new Subject();

  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  stripePaymentRequest: StripePaymentRequest = null;

  protected readonly currencyPipe = inject(PeCurrencyPipe);
  private readonly stripeFlowService = inject(StripeFlowService);
  private storageService = inject(StorageService);

  ngOnInit(): void {
    super.ngOnInit();
    this.initStripe();

    this.buttonText.next($localize`:@@payment-stripe-wallet.actions.pay:\
        ${this.currencyPipe.transform(this.flow.total, this.flow.currency, 'symbol', '1.2-2')}:total:`);
  }

  private initStripe(): void {
    combineLatest([
      this.stripeFlowService.getStripeData(),
      this.addScriptToPage(),
    ]).subscribe((data) => {
      const Stripe: any = (window as any).Stripe;
      if (!Stripe) {
        throw new Error('Stripe is not loaded to use!');
      }
      const stripe: IStripe = Stripe(data[0].publishKey, {
        apiVersion: '2020-08-27',
      });

      let paymentRequest: StripePaymentRequest = null;
      try {

        const disableWallets: string[] = [];
        if (this.paymentMethod === PaymentMethodEnum.APPLE_PAY) {
          disableWallets.push('googlePay');
        }
        if (this.paymentMethod === PaymentMethodEnum.GOOGLE_PAY) {
          disableWallets.push('applePay');
        }

        let forceEnableBrowserCard = false;
        try {
          forceEnableBrowserCard = !!this.storageService.get('pe_force_enable_stripe_wallet_browser_card');
        } catch (e) { }

        if (!this.allowBrowserCard && !forceEnableBrowserCard) {
          disableWallets.push('browserCard');
        }

        paymentRequest = stripe.paymentRequest({
          country: this.settings.companyAddress?.country.toUpperCase() ?? DEFAULT_BUSINESS_COUNTRY,
          currency: this.flow.currency.toLowerCase(),
          total: {
            label: 'Total',
            amount: Math.round(100 * data[0].totalCharge),
          },
          disableWallets,
          requestPayerName: false,
          requestPayerEmail: false,
        } as any); // Have to use `any` because interface doens't have `disableWallets`
      } catch (e: any) {
        this.stripeError = e?.message;
        this.cdr.detectChanges();

        return;
      }

      paymentRequest.canMakePayment().then((result) => {
        // We ignore result because it always returns false for googlePay and applePay
        // and we don't use stripe pay button.
        // But we have to call canMakePayment() because it's not allowed to pay without this call.
        this.onServiceReady.emit(true);

        paymentRequest.on('cancel', () => {
          this.stripeFlowService.confirmCardPayment$.next({ cancel: true });
          this.isShowingWallet = false;
          this.cdr.detectChanges();
        });
        // Copied from documentation:
        //  https://stripe.com/docs/stripe-js/elements/payment-request-button#html-js-complete-payment
        //  https://stripe.com/docs/js/payment_request/create#stripe_payment_request-options-disableWallets
        paymentRequest.on('paymentmethod', (ev: any) => {
          this.isShowingWallet = false;

          this.stripeFlowService.postPayment$.subscribe((status) => {
            if (!status) {
              return;
            }
            const payment = this.store.selectSnapshot(PaymentState.response);
            stripe.confirmCardPayment(
              payment.paymentDetails.clientSecret,
              { payment_method: ev.paymentMethod.id },
              { handleActions: false }
            ).then((confirmResult: stripe.PaymentIntentResponse) => {
              this.stripeFlowService.confirmCardPayment$.next(confirmResult);
              if (confirmResult.error) {
                // Report to the browser that the payment failed, prompting it to
                // re-show the payment interface, or show an error message and close
                // the payment interface.
                ev.complete('fail');
              } else {
                // Report to the browser that the confirmation was successful, prompting
                // it to close the browser payment method collection interface.
                ev.complete('success');
                // Check if the PaymentIntent requires any actions and if so let Stripe.js
                // handle the flow. If using an API version older than "2019-02-11" instead
                // instead check for: `paymentIntent.status === "requires_source_action"`.
                if (confirmResult.paymentIntent.status === 'requires_action') {
                  // Let Stripe.js handle the rest of the payment flow.
                  stripe.confirmCardPayment(payment.paymentDetails.clientSecret);
                }
              }
            });
          });
        });
        this.stripePaymentRequest = paymentRequest;
      });
    },
      (err) => {
        this.onServiceReady.emit(true);
        this.stripeError = err.message;
      });
  }

  tryAgain(): void {
    this.sendPaymentData();
  }

  triggerSubmit(): void {
    this.sendPaymentData();
  }

  protected sendPaymentData(): void {

    if (!this.paymentOption) {
      throw new Error('Payment method not presented in list!');
    }

    this.stripeShowWallet();
  }

  protected stripeShowWallet(): void {

    if (this.isSendingPayment) {
      return;
    }

    if (!this.stripePaymentRequest) {
      return;
    }

    try {
      this.stripePaymentRequest.show();
      this.stripeFlowService.confirmCardPayment$.next({
        inProgress: true,
      });
      this.continue.emit();
      this.cdr.detectChanges();
    } catch (e: any) {
      this.stripeError = e?.message;
      this.isFinishModalShown$.next(false);
      this.cdr.detectChanges();
    }
  }

  protected addScriptToPage(): Observable<boolean> {
    return new Observable((obs) => {
      const scriptUrl = 'https://js.stripe.com/v3/';
      const scriptId = 'pe-js-stripe-com-v3';

      const existing: HTMLScriptElement = document.getElementById(scriptId) as HTMLScriptElement;
      if (existing) {
        obs.next(true);
      } else {
        const script: HTMLScriptElement = document.createElement('script');
        script.id = scriptId;
        script.src = scriptUrl;
        script.onload = () => {
          obs.next(true);
        };
        script.onerror = (err) => {
          obs.error(err);
        };
        document.head.appendChild(script);
      }
    });
  }
}
