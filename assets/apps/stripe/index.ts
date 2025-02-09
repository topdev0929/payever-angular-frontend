import { Step } from '../../scripts/types'

export { stripePaymentTextClasses } from  './fields';

export { stripeDebitCardPaymentSteps } from  './scripts/debit-card-steps';
export const STRIPE_DEBIT_CARD_PAYMENT_STEPS: Step = 3;

export { stripeCreditCardPaymentSteps } from  './scripts/credit-card-steps';
export const STRIPE_CREDIT_CARD_PAYMENT_STEPS: Step = 3;