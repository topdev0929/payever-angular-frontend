import { PaymentMethodEnum } from '@pe/checkout/types';

export const PAYMENTS_REQUIRING_VERIFICATION = [
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT,
  PaymentMethodEnum.SANTANDER_POS_INVOICE_DE,
  PaymentMethodEnum.SANTANDER_POS_FACTORING_DE,
];
