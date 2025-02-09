import {
  PaymentRequestPaymentMethodEvent,
  PaymentRequestShippingAddressEvent,
  PaymentRequestShippingOptionEvent,
} from '@stripe/stripe-js';

export interface PaymentRequestShippingAddressSource {
  source: 'shippingaddresschange';
  data: PaymentRequestShippingAddressEvent;
}

export interface PaymentRequestShippingOptionSource {
  source: 'shippingoptionchange';
  data: PaymentRequestShippingOptionEvent;
}

export interface PaymentRequestSource {
  source: 'success' | 'cancel';
  data?: PaymentRequestPaymentMethodEvent;
}

export type PaymentRequestEvent = PaymentRequestSource
  | PaymentRequestShippingAddressSource
  | PaymentRequestShippingOptionSource;
