import { Step } from '../../scripts/types';

export { swedbankPaymentTextClasses } from  './fields';

export { swedbankInvoicePaymentSteps } from  './scripts/invoice-steps';
export const SWEDBANK_INVOICE_STEPS_COUNT: Step = 6;

export { swedbankCreditCardPaymentSteps } from  './scripts/credit-card-steps';
export const SWEDBANK_CREDIT_CARD_STEPS_COUNT: Step = 5;