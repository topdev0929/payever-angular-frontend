import { PaymentMethodEnum } from "@pe/checkout-types";

export const CHECKOUT_PAYMENTS = [
  PaymentMethodEnum.SANTANDER_INSTALLMENT_AT,
  PaymentMethodEnum.SANTANDER_INSTALLMENT,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_DK,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_NO,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_SE,
  PaymentMethodEnum.SANTANDER_FACTORING_DE,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_NL,
  PaymentMethodEnum.ZINIA_INSTALMENT,
  PaymentMethodEnum.ZINIA_INSTALMENT_DE,
];

export const IFRAME_PAYMENTS = [
  PaymentMethodEnum.APPLE_PAY,
];
