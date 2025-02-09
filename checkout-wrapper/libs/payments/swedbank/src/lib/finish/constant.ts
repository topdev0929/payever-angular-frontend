import { PaymentMethodEnum } from '@pe/checkout/types';

export const PAYEX_HOST_VIEW: {
  [key in PaymentMethodEnum]?: string;
} = {
  [PaymentMethodEnum.SWEDBANK_CREDITCARD]: 'creditCard',
  [PaymentMethodEnum.SWEDBANK_INVOICE]: 'invoice',
  [PaymentMethodEnum.SWEDBANK_VIPPS]: 'vipps',
  [PaymentMethodEnum.SWEDBANK_MOBILE_PAY]: 'mobilepay',
  [PaymentMethodEnum.SWEDBANK_SWISH]: 'swish',
  [PaymentMethodEnum.SWEDBANK_TRUSTLY]: 'trustly',
};
