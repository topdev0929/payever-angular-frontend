/**
 * This file is deprecated. Everything should be moved either to environment or directly to api service.
 */

import { Params } from '@angular/router';

import { PaymentMethodEnum } from '@pe/checkout/types';

export const editQueryParams: Params = {
  billingAddress: 'edit-billing-address',
  order: 'edit-order',
  shippingAddress: 'edit-shipping-address',
};

export const hasSecondStepPaymentMethods: PaymentMethodEnum[] = [
  PaymentMethodEnum.SANTANDER_FACTORING_DE,
  PaymentMethodEnum.SANTANDER_INSTALLMENT,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_SE,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_DK,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_NO,
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT,
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_DK,
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_NO,
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_SE,
  PaymentMethodEnum.SANTANDER_INVOICE_DE,
  PaymentMethodEnum.SANTANDER_INVOICE_NO,
  PaymentMethodEnum.SANTANDER_POS_INVOICE_NO,
];

export const noRememberMe: PaymentMethodEnum[] = [
  PaymentMethodEnum.SWEDBANK_CREDITCARD,
  PaymentMethodEnum.SWEDBANK_INVOICE,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_DK,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_NO,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_SE,
  PaymentMethodEnum.SANTANDER_INVOICE_NO,
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_DK,
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_NO,
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_SE,
  PaymentMethodEnum.SANTANDER_POS_INVOICE_NO,
];

export const noShippingAddress: PaymentMethodEnum[] = [
  PaymentMethodEnum.SANTANDER_POS_INSTALLMENT,
  PaymentMethodEnum.SANTANDER_INVOICE_DE,
  PaymentMethodEnum.SANTANDER_POS_INVOICE_DE,
  PaymentMethodEnum.SANTANDER_INVOICE_NO,
  PaymentMethodEnum.SANTANDER_POS_INVOICE_NO,
  PaymentMethodEnum.SWEDBANK_INVOICE,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_DK,
  PaymentMethodEnum.GOOGLE_PAY,
];

export const BIC_PATTERN = '^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$';
export const DATE_PATTERN = '([0-2][0-9])|(3[01]).(0[1-9])|(1[0-2]).(19)|(20)[0-9]{2}';
export const MONTH_PATTERN = '(0[1-9])|(1[0-2]).(19)|(20)[0-9]{2}';
// Pattern for Sweden Social Security Number
export const SSN_PATTERN = '^([0-9]{10}|[0-9]{12}|[0-9]{6}-[0-9]{4}|[0-9]{8}-[0-9]{4})$';

export const HEADER_WITH_PADDING_HEIGHT: number = 55 + 11;
export const PANEL_HEIGHT = 47;
