import { AddressInterface } from '../../models';

import { ShippingOption } from './custom-widget-config.interface';

interface Payment {
  total: number;
  amount: number;
  currency: string;
  channel: string;
  businessId: string;
  businessName: string;
  reference: string;
  channelSetId: string;
  flowId: string;
  deliveryFee: number;
  billingAddress: AddressInterface;
  shippingAddress: AddressInterface;
  shippingOption: ShippingOption;
  apiCallId: string;
}

interface PaymentDetails {
  express?: boolean;
  frontendFinishUrl: string;
  frontendCancelUrl: string;
  frontendFailureUrl: string;
  quoteCallbackUrl: string;
}

export interface PaymentItem {
  description: string;
  identifier: string;
  price: number;
  quantity: number;
  thumbnail: string;
  name: string;
  unit: string;
  amount: number;
}

export interface PaymentPayload {
  payment: Payment;
  paymentDetails: PaymentDetails;
  paymentItems: PaymentItem[];
}
