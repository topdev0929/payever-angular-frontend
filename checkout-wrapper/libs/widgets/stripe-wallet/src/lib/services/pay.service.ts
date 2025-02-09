import { Injectable, inject } from '@angular/core';
import {
  PaymentRequestWallet,
  Stripe,
  loadStripe,
} from '@stripe/stripe-js';
import { BehaviorSubject, EMPTY, ReplaySubject, from, merge } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';

import { ComponentConfig } from '../models';

import { PaymentRequestAdapter } from './payment-request-adapter.class';
import { PaymentRequestService } from './payment-request.service';
import { StripeWalletService } from './stripe-wallet.service';

const PAYMENT_WALLET: { [key in PaymentMethodEnum]?: PaymentRequestWallet[] } = {
  apple_pay: ['googlePay', 'browserCard', 'link'],
  google_pay: ['applePay', 'browserCard', 'link'],
};

const TOTAL_LABEL = 'Total';

@Injectable()
export class PayService {

  private readonly stripeService = inject(StripeWalletService);
  private readonly paymentRequestService = inject(PaymentRequestService);

  private readonly amount$ = new ReplaySubject<number>(1);
  private readonly deliveryFee$ = new BehaviorSubject<number>(0);

  public init(
    componentConfig: ComponentConfig,
    paymentMethod: PaymentMethodEnum,
  ) {
    return this.stripeService.getPublishKey(
      paymentMethod,
      componentConfig.channelSet,
      componentConfig.amount,
      componentConfig.config.shippingOption?.price ?? 0,
    ).pipe(
      switchMap(({
        flow: { country, currency },
        initData: { publishKey, totalCharge },
      }) => from(
        loadStripe(publishKey, { apiVersion: '2023-10-16' })
      ).pipe(
        switchMap((stripe) => {
          const amount = Math.round(100 * totalCharge);
          this.amount$.next(amount);

          const paymentRequest = new PaymentRequestAdapter(
            stripe.paymentRequest({
              country,
              currency: currency?.toLowerCase(),
              total: {
                label: TOTAL_LABEL,
                amount: amount,
              },
              disableWallets: PAYMENT_WALLET[paymentMethod],
              requestPayerEmail: true,
              requestPayerName: true,
              requestPayerPhone: true,
              requestShipping: !!componentConfig.config?.quoteCallbackUrl,
              shippingOptions: [],
            }),
          );

          return paymentRequest.canMakePayment().pipe(
            map(() => ({
              stripe,
              paymentRequest,
            })),
          );
        })
      )),
    );
  }

  public pay(
    componentConfig: ComponentConfig,
    paymentMethod: PaymentMethodEnum,
    paymentRequest: PaymentRequestAdapter,
    stripe: Stripe,
  ) {
    return this.stripeService.createFlow(
      componentConfig.channelSet,
      componentConfig.config,
      componentConfig.amount,
    ).pipe(
      switchMap(flow =>
        this.stripeService.getCallbacks(flow.id, flow.guestToken).pipe(
          switchMap(callbacks => this.amount$.pipe(
            switchMap(amount => merge(
              paymentRequest.success().pipe(
                tap(event => event.shippingOption
                  && this.deliveryFee$.next(event.shippingOption.amount / 100)),
                switchMap(event => this.stripeService.submitPayment(
                  paymentMethod,
                  flow,
                  componentConfig.config,
                  this.deliveryFee$.getValue(),
                  event.shippingAddress,
                  event.shippingOption,
                ).pipe(
                  switchMap(({ paymentDetails: { clientSecret } }) =>
                    this.paymentRequestService.confirmPayment(event, stripe, clientSecret).pipe(
                      filter(value => !!value),
                      tap(() => {
                        window.top.location.href = callbacks.successUrl;
                      }),
                    ),
                  ),
                )),
              ),
              paymentRequest.cancel().pipe(
                tap(() => {
                  window.top.location.href = callbacks.cancelUrl;
                }),
              ),
              paymentRequest.shippingAddressChange().pipe(
                switchMap(({ updateWith, shippingAddress }) => {
                  if (!componentConfig.config?.quoteCallbackUrl) {
                    return EMPTY;
                  }

                  return this.stripeService.getShippingOptions(
                    componentConfig.config?.quoteCallbackUrl,
                    {
                      country: shippingAddress.country,
                      zipCode: shippingAddress.postalCode,
                    }
                  ).pipe(
                    tap((shippingOptions) => {
                      if (!shippingOptions?.length) {
                        updateWith({
                          status: 'invalid_shipping_address',
                        });

                        return;
                      }

                      const option = shippingOptions[0];

                      updateWith({
                        status: 'success',
                        total: {
                          amount: amount + (option?.amount ?? 0),
                          label: TOTAL_LABEL,
                        },
                        shippingOptions,
                      });
                    }),
                    catchError(() => {
                      updateWith({
                        status: 'fail',
                      });

                      return EMPTY;
                    })
                  );
                }),
              ),
              paymentRequest.shippingOptionChange().pipe(
                tap(({ updateWith, shippingOption }) => {
                  updateWith({
                    status: 'success',
                    total: {
                      amount: amount + shippingOption.amount,
                      label: TOTAL_LABEL,
                    },
                  });
                  this.deliveryFee$.next(shippingOption.amount / 100);
                }),
              ),
            )),
          )),
        ),
      ),
    );
  }
}
