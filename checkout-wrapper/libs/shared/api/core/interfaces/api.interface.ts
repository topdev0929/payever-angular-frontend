import { CartItemInterface, PaymentMethodEnum } from '@pe/checkout/types';

export interface CreatePaymentCodeParamsInterface {
  amount?: number;
  source?: string;
  paymentFlowId?: string;
  phoneNumber?: string;
}

export enum VerificationTypeEnum {
  VERIFY_BY_PAYMENT = 0,
  VERIFY_BY_ID = 1
}

export interface ChannelSetDeviceSettingsInterface {
  autoresponderEnabled: boolean;
  enabled: boolean;
  secondFactor: boolean;
  verificationType: VerificationTypeEnum;
}

export enum LegalDocumentEnum {
  Disclaimer = 'disclaimer',
  TermsAndServices = 'terms_and_services',
  PrivacyStatements = 'privacy_statements',
  RefundPolicy = 'refund_policy',
  ShippingPolicy = 'shipping_policy',
  CookiePolicy = 'cookie_policy'
}

export interface ProductsBillingSubscription {
  _id: string;
  business: string;
  product: string;
  connection: {
    _id: string;
    integrationName: string;
  };
  subscriptionPlan: {
    _id: string;
    billingPeriod: 1
    interval: string;
    planType: string;
    product: string;
  };
}

export interface FinExpApiCallInterface {
  paymentMethod: PaymentMethodEnum;
  amount: number;
  cart?: CartItemInterface[];
  reference?: string;
  successUrl?: string;
  pendingUrl?: string;
  cancelUrl?: string;
  failureUrl?: string;
  noticeUrl?: string;
}

export interface CreateFinExpResponseInterface {
  guestToken: string;
  guest_token?: string;
  id: string;
}
