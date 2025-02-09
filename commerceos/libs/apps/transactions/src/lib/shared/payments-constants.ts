import { PaymentMethodEnum } from '@pe/checkout-types';

import { PaymentType } from './interfaces';

export const paymentsHaveNoSpecificStatus: PaymentType[] = [
  PaymentMethodEnum.SOFORT,
  PaymentMethodEnum.SANTANDER_FACTORING_DE,
  PaymentMethodEnum.SANTANDER_POS_FACTORING_DE,
  PaymentMethodEnum.SANTANDER_INVOICE_DE,
  PaymentMethodEnum.SANTANDER_POS_INVOICE_DE,
];

export const paymentsHaveCreditAnswer: PaymentMethodEnum[] = [
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT,
  PaymentMethodEnum.SANTANDER_INSTALLMENT,
];

export const paymentsHaveAuthorizeAllowed = [
  PaymentMethodEnum.SWEDBANK_CREDITCARD,
  PaymentMethodEnum.SWEDBANK_INVOICE,
];

export const paymentsHaveNoSignedField = [
  PaymentMethodEnum.SANTANDER_POS_INVOICE_DE,
];

export const paymentsHaveAmountForCancel: PaymentType[] = [
  PaymentMethodEnum.SANTANDER_INSTALLMENT_NO,
];
