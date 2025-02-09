import { PaymentMethodEnum } from '@pe/checkout-types';

export interface ChannelSettingsInterface {
  bubble?: BubbleInterface;
  button?: ButtonInterface;
  calculator?: CalculatorInterface;
  textLink?: TextLinkInterface;
}

export interface BubbleInterface {
  visibility: boolean;
  checkoutOverlay: boolean;
  calculatorOverlay: boolean;
}

export interface StorePosListInterface {
  active: boolean;
  name: string;
  id: string;
  isToggled?: boolean;
}

export interface ButtonInterface {
  textSize: string;
  textColor: string;
  buttonColor: string;
  alignment: string;
  corner: string;
  visibility?: boolean;
  adaptive?: boolean;
  checkoutOverlay?: boolean;
  calculatorOverlay?: boolean;
}

export interface CalculatorInterface {
  textColor: string;
  buttonColor: string;
  linkColor: string;
  backgroundColor: string;
  visibility: boolean;
  adaptive: boolean;
  checkoutOverlay: boolean;
  calculatorOverlay: boolean;
}

export interface TextLinkInterface {
  textSize: string;
  alignment: string;
  linkColor: string;
  visibility?: boolean;
  adaptive?: boolean;
  checkoutOverlay?: boolean;
  calculatorOverlay?: boolean;
}

export interface PaymentOptionsInterface {
  id: string;
  min: number;
  max: number;
  payment_method: PaymentMethodEnum;
}

export interface DefaultConnectionInterface {
  integration: string;
  _id: string;
}

export interface SantanderDkProductInterface {
  accountFee: number;
  effectiveInterest: number;
  establishmentFee: number;
  id: number;
  isSafeInsuranceAllowed: boolean;
  maxAmount: number;
  maxMonth: number;
  minAmount: number;
  minMonth: number;
  name: string;
  nominalInterest: number;
  safeInsurancePercentOfMonthlyPayment: number;
  paymentFreePeriod: {
    interestRate: number;
    payInstallments: boolean;
    payLaterType: boolean;
    termsInMonths: number;
  };
}
