import { Injectable } from '@angular/core';
import {
  PaymentRequest,
  PaymentRequestPaymentMethodEvent,
  PaymentRequestShippingAddressEvent,
  PaymentRequestShippingOptionEvent,
  Stripe,
} from '@stripe/stripe-js';
import { Observable, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { PaymentRequestEvent } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PaymentRequestService {

  public listenToPaymentRequest(paymentRequest: PaymentRequest) {
    return new Observable<PaymentRequestEvent>((observer) => {
      paymentRequest.once('paymentmethod', (event: PaymentRequestPaymentMethodEvent) => {
        observer.next({ source: 'success', data: event });
        observer.complete();
      });

      paymentRequest.once('cancel', () => {
        observer.next({ source: 'cancel' });
        observer.complete();
      });

      paymentRequest.on('shippingaddresschange', (event: PaymentRequestShippingAddressEvent) => {
        observer.next({ source: 'shippingaddresschange', data: event });
      });

      paymentRequest.on('shippingoptionchange', (event: PaymentRequestShippingOptionEvent) => {
        observer.next({ source: 'shippingoptionchange', data: event });
      });
    });
  }

  public confirmPayment(
    event: PaymentRequestPaymentMethodEvent,
    stripe: Stripe,
    clientSecret: string,
  ) {
    return from(
      stripe.confirmCardPayment(
        clientSecret,
        { payment_method: event.paymentMethod.id },
        { handleActions: false }
      ),
    ).pipe(
      switchMap((confirmResult) => {
        if (confirmResult.error) {
          event.complete('fail');

          return of(false);
        }
        event.complete('success');
        if (confirmResult.paymentIntent.status === 'requires_action') {
          return from(stripe.confirmCardPayment(clientSecret));
        }

        return of(confirmResult);
      }),
    );
  }
}
