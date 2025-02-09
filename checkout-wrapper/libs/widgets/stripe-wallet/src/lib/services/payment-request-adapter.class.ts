import type {
  PaymentRequestShippingAddressEvent,
  PaymentRequest,
  PaymentRequestPaymentMethodEvent,
  PaymentRequestShippingOptionEvent,
} from '@stripe/stripe-js';
import { Observable, from } from 'rxjs';

export class PaymentRequestAdapter {
  constructor(private readonly paymentRequest: PaymentRequest) {}

  public readonly success = () => new Observable<PaymentRequestPaymentMethodEvent>(
    (observer) => {
      this.paymentRequest.once('paymentmethod', (event) => {
        observer.next(event);
        observer.complete();
      });

      () => observer.complete();
    });

  public readonly cancel = () => new Observable<void>(
    (observer) => {
      this.paymentRequest.once('cancel', () => {
        observer.next();
        observer.complete();
      });

      () => observer.complete();
    });

  public readonly shippingAddressChange = () => new Observable<PaymentRequestShippingAddressEvent>(
    (observer) => {
      this.paymentRequest.on('shippingaddresschange', (event) => {
        observer.next(event);
      });

      () => observer.complete();
    });

  public readonly shippingOptionChange = () => new Observable<PaymentRequestShippingOptionEvent>(
    (observer) => {
      this.paymentRequest.on('shippingoptionchange', (event) => {
        observer.next(event);
      });

      () => observer.complete();
    });

  public canMakePayment() {
    return from(this.paymentRequest.canMakePayment());
  }

  public show() {
    this.paymentRequest.show();
  }
}
