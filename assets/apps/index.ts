import { PaymentDemo } from '../scripts/types';
import { PaymentDemoSetting } from '../scripts/interfaces';

import { ZINIA_STEPS_COUNT, ziniaPaymentSteps, ziniaPaymentTextClasses } from './zinia';
import { ALLIANZ_STEPS_COUNT, allianzPaymentSteps, allianzPaymentTextClasses } from './allianz';
import { INSTANT_STEPS_COUNT, instantPaymentSteps, instantPaymentTextClasses } from './instant';
import { IDEAL_STEPS_COUNT, idealPaymentSteps, idealPaymentTextClasses } from './ideal';

import {
  swedbankPaymentTextClasses,
  SWEDBANK_INVOICE_STEPS_COUNT,
  swedbankInvoicePaymentSteps,
  SWEDBANK_CREDIT_CARD_STEPS_COUNT,
  swedbankCreditCardPaymentSteps,
} from './swedbank';

import { IVY_STEPS_COUNT, ivyPaymentSteps, ivyPaymentTextClasses } from './ivy';
import { VIPPS_STEPS_COUNT, vippsPaymentSteps, vippsPaymentTextClasses } from './vipps';
import { PAYPAL_STEPS_COUNT, payPalPaymentSteps, payPalTextClasses } from './paypal';
import { SWISH_STEPS_COUNT, swishPaymentSteps, swishPaymentTextClasses } from './swish';

import { 
  santanderInstallmentPaymentTextClasses,
  SANTANDER_INSTALLMENT_DE_STEPS_COUNT,
  santanderInstallmentDEPaymentSteps,
  SANTANDER_INSTALLMENT_AT_STEPS_COUNT,
  santanderInstallmentATPaymentSteps,
  SANTANDER_INSTALLMENT_UK_STEPS_COUNT,
  santanderInstallmentUKPaymentSteps,
  SANTANDER_INSTALLMENT_DE_POS_STEPS_COUNT,
  santanderInstallmentDEPoSPaymentSteps,
  santanderInstallmentSEIndustryHandler,
  SANTANDER_INSTALLMENT_SE_STEPS_COUNT,
  santanderInstallmentSEPaymentSteps,
  SANTANDER_INSTALLMENT_NO_STEPS_COUNT,
  santanderInstallmentNOPaymentSteps,
  santanderInstallmentNOIndustryHandler,
  SANTANDER_INSTALLMENT_DK_STEPS_COUNT,
  santanderInstallmentDKPaymentSteps,
  santanderInstallmentDKIndustryHandler,
  SANTANDER_INSTALLMENT_FI_STEPS_COUNT,
  santanderInstallmentFIPaymentSteps,
  SANTANDER_INSTALLMENT_NL_STEPS_COUNT,
  SANTANDER_INSTALLMENT_NL_STEPS_COUNT_MOBILE,
  santanderInstallmentNLPaymentSteps,
  SANTANDER_INSTALLMENT_BE_STEPS_COUNT,
  santanderInstallmentBEPaymentSteps,
} from './santander';

import { MOBILE_PAY_STEPS_COUNT, mobilePayPaymentSteps, mobilePayPaymentTextClasses } from './mobile-pay';
import { TRUSTLY_STEPS_COUNT, trustlyPaymentSteps, trustlyPaymentTextClasses } from './trustly';

import {
  stripePaymentTextClasses,
  STRIPE_DEBIT_CARD_PAYMENT_STEPS,
  stripeDebitCardPaymentSteps,
  STRIPE_CREDIT_CARD_PAYMENT_STEPS,
  stripeCreditCardPaymentSteps,
} from './stripe';

import { SOFORT_STEPS_COUNT, sofortPaymentSteps, sofortPaymentTextClasses } from './sofort';
import { GOOGLE_PAY_STEPS_COUNT, googlePayPaymentSteps, googlePayPaymentTextClasses } from './google-pay';
import { APPLE_PAY_STEPS_COUNT, applePayPaymentSteps, applePayPaymentTextClasses } from './apple-pay';
import { WIRE_TRANSFER_STEPS_COUNT, wireTransferPaymentSteps, wireTransferPaymentTextClasses } from './wire-transfer';

const PAYMENTS_SETTINGS_MAP: { [key in PaymentDemo]: PaymentDemoSetting } = {
  [PaymentDemo.ZINIA]: {
    stepsCount: ZINIA_STEPS_COUNT,
    stepsHandler: ziniaPaymentSteps,
    textClasses: ziniaPaymentTextClasses,
  },
  [PaymentDemo.ALLIANZ]: {
    stepsCount: ALLIANZ_STEPS_COUNT,
    stepsHandler: allianzPaymentSteps,
    textClasses: allianzPaymentTextClasses,
  },
  [PaymentDemo.INSTANT]: {
    stepsCount: INSTANT_STEPS_COUNT,
    stepsHandler: instantPaymentSteps,
    textClasses: instantPaymentTextClasses,
  },
  [PaymentDemo.IDEAL]: {
    stepsCount: IDEAL_STEPS_COUNT,
    stepsHandler: idealPaymentSteps,
    textClasses: idealPaymentTextClasses,
  },
  [PaymentDemo.SWEDBANK_INVOICE]: {
    stepsCount: SWEDBANK_INVOICE_STEPS_COUNT,
    stepsHandler: swedbankInvoicePaymentSteps,
    textClasses: swedbankPaymentTextClasses,
  },
  [PaymentDemo.SWEDBANK_CREDIT_CARD]: {
    stepsCount: SWEDBANK_CREDIT_CARD_STEPS_COUNT,
    stepsHandler: swedbankCreditCardPaymentSteps,
    textClasses: swedbankPaymentTextClasses,
  },
  [PaymentDemo.IVY]: {
    stepsCount: IVY_STEPS_COUNT,
    stepsHandler: ivyPaymentSteps,
    textClasses: ivyPaymentTextClasses,
  },
  [PaymentDemo.VIPPS]: {
    stepsCount: VIPPS_STEPS_COUNT,
    stepsHandler: vippsPaymentSteps,
    textClasses: vippsPaymentTextClasses,
  },
  [PaymentDemo.PAYPAL]: {
    stepsCount: PAYPAL_STEPS_COUNT,
    stepsHandler: payPalPaymentSteps,
    textClasses: payPalTextClasses,
  },
  [PaymentDemo.SWISH]: {
    stepsCount: SWISH_STEPS_COUNT,
    stepsHandler: swishPaymentSteps,
    textClasses: swishPaymentTextClasses,
  },
  [PaymentDemo.SANTANDER_INSTALLMENT_DE]: {
    stepsCount: SANTANDER_INSTALLMENT_DE_STEPS_COUNT,
    stepsHandler: santanderInstallmentDEPaymentSteps,
    textClasses: santanderInstallmentPaymentTextClasses,
  },
  [PaymentDemo.SANTANDER_INSTALLMENT_AT]: {
    stepsCount: SANTANDER_INSTALLMENT_AT_STEPS_COUNT,
    stepsHandler: santanderInstallmentATPaymentSteps,
    textClasses: santanderInstallmentPaymentTextClasses,
  },
  [PaymentDemo.SANTANDER_INSTALLMENT_UK]: {
    stepsCount: SANTANDER_INSTALLMENT_UK_STEPS_COUNT,
    stepsHandler: santanderInstallmentUKPaymentSteps,
    textClasses: santanderInstallmentPaymentTextClasses,
  },
  [PaymentDemo.SANTANDER_INSTALLMENT_DE_POS]: {
    stepsCount: SANTANDER_INSTALLMENT_DE_POS_STEPS_COUNT,
    stepsHandler: santanderInstallmentDEPoSPaymentSteps,
    textClasses: santanderInstallmentPaymentTextClasses,
  },
  [PaymentDemo.SANTANDER_INSTALLMENT_SE]: {
    stepsCount: SANTANDER_INSTALLMENT_SE_STEPS_COUNT,
    stepsHandler: santanderInstallmentSEPaymentSteps,
    stepsIndustryHandler: santanderInstallmentSEIndustryHandler,
    textClasses: santanderInstallmentPaymentTextClasses,
  },
  [PaymentDemo.SANTANDER_INSTALLMENT_NO]: {
    stepsCount: SANTANDER_INSTALLMENT_NO_STEPS_COUNT,
    stepsHandler: santanderInstallmentNOPaymentSteps,
    stepsIndustryHandler: santanderInstallmentNOIndustryHandler,
    textClasses: santanderInstallmentPaymentTextClasses,
  },
  [PaymentDemo.SANTANDER_INSTALLMENT_DK]: {
    stepsCount: SANTANDER_INSTALLMENT_DK_STEPS_COUNT,
    stepsHandler: santanderInstallmentDKPaymentSteps,
    stepsIndustryHandler: santanderInstallmentDKIndustryHandler,
    textClasses: santanderInstallmentPaymentTextClasses,
  },
  [PaymentDemo.SANTANDER_INSTALLMENT_FI]: {
    stepsCount: SANTANDER_INSTALLMENT_FI_STEPS_COUNT,
    stepsHandler: santanderInstallmentFIPaymentSteps,
    textClasses: santanderInstallmentPaymentTextClasses,
  },
  [PaymentDemo.SANTANDER_INSTALLMENT_NL]: {
    stepsCount: SANTANDER_INSTALLMENT_NL_STEPS_COUNT,
    stepsCountMobile: SANTANDER_INSTALLMENT_NL_STEPS_COUNT_MOBILE,
    stepsHandler: santanderInstallmentNLPaymentSteps,
    textClasses: santanderInstallmentPaymentTextClasses,
  },
  [PaymentDemo.SANTANDER_INSTALLMENT_BE]: {
    stepsCount: SANTANDER_INSTALLMENT_BE_STEPS_COUNT,
    stepsHandler: santanderInstallmentBEPaymentSteps,
    textClasses: santanderInstallmentPaymentTextClasses,
  },
  [PaymentDemo.MOBILE_PAY]: {
    stepsCount: MOBILE_PAY_STEPS_COUNT,
    stepsHandler: mobilePayPaymentSteps,
    textClasses: mobilePayPaymentTextClasses,
  },
  [PaymentDemo.TRUSTLY]: {
    stepsCount: TRUSTLY_STEPS_COUNT,
    stepsHandler: trustlyPaymentSteps,
    textClasses: trustlyPaymentTextClasses,
  },
  [PaymentDemo.STRIPE_DEBIT_CARD]: {
    stepsCount: STRIPE_DEBIT_CARD_PAYMENT_STEPS,
    stepsHandler: stripeDebitCardPaymentSteps,
    textClasses: stripePaymentTextClasses,
  },
  [PaymentDemo.STRIPE_CREDIT_CARD]: {
    stepsCount: STRIPE_CREDIT_CARD_PAYMENT_STEPS,
    stepsHandler: stripeCreditCardPaymentSteps,
    textClasses: stripePaymentTextClasses,
  },
  [PaymentDemo.SOFORT]: {
    stepsCount: SOFORT_STEPS_COUNT,
    stepsHandler: sofortPaymentSteps,
    textClasses: sofortPaymentTextClasses,
  },
  [PaymentDemo.GOOGLE_PAY]: {
    stepsCount: GOOGLE_PAY_STEPS_COUNT,
    stepsHandler: googlePayPaymentSteps,
    textClasses: googlePayPaymentTextClasses,
  },
  [PaymentDemo.APPLE_PAY]: {
    stepsCount: APPLE_PAY_STEPS_COUNT,
    stepsHandler: applePayPaymentSteps,
    textClasses: applePayPaymentTextClasses,
  },
  [PaymentDemo.WIRE_TRANSFER]: {
    stepsCount: WIRE_TRANSFER_STEPS_COUNT,
    stepsHandler: wireTransferPaymentSteps,
    textClasses: wireTransferPaymentTextClasses,
  },
};

export const getPaymentDemoSettings = (): PaymentDemoSetting => {
  const bodyElement = document.body;
  const paymentDemo = bodyElement.getAttribute('data-payment-demo') as PaymentDemo;
  
  return PAYMENTS_SETTINGS_MAP[paymentDemo];
}