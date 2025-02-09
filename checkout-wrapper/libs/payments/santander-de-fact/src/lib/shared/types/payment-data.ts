import { SalutationEnum } from '@pe/checkout/types';

import { FormRatesCheckboxes1Interface, FormRatesDataInterface, FormRatesMainInterface } from './form';

export interface BaseFormDataInterface {
  conditionsAccepted?: boolean;
  advertisingAccepted?: boolean;
  birthday?: string;
  phone?: string;
  personalSalutation?: SalutationEnum;

  riskSessionId?: string; // We add it manually at moment of sending
  creditAmount: number;
}

export interface RateDataInterface extends BaseFormDataInterface {
  duration: number;
  initializeUniqueId: string;
  annualPercentageRate: number;
  interestRate?: number;
  monthlyPayment?: number;
  lastMonthPayment?: number;
  totalCreditCost?: number;
  contractPdfUrl?: string;
}

export interface NodeSetupRateInterface extends BaseFormDataInterface {
  duration: number;
  initializeUniqueId: string;
  annualPercentageRate: number;
  shopUserSession: string;
}

export interface SetupRateInterface {
  advertisingAccepted?: boolean;
  annualPercentageRate?: number;
  birthday?: string | Date;
  conditionsAccepted?: boolean;
  contractPdfUrl?: string;
  creditAmount?: number;
  duration?: number;
  initializeUniqueId?: string;
  interestRate?: number;
  lastMonthPayment?: number;
  monthlyPayment?: number;
  posMerchantMode?: boolean;
  riskSessionId?: string;
  shopUserSession?: string;
  totalCreditCost?: number;
}

export interface RiskSessionInterface {
  riskSessionId?: string;
}

export interface NodePaymentRequestInterface extends
  SetupRateInterface, RiskSessionInterface {
  ___?: void;
}

export interface PaymentDataInterface {
  advertisingAccepted?: boolean;
  annualPercentageRate?: number;
  birthday?: string | Date;
  conditionsAccepted?: boolean;
  contractPdfUrl?: string;
  duration?: number;
  errorCode?: string;
  initializeUniqueId?: string;
  interestRate?: number;
  lastMonthPayment?: number;
  monthlyPayment?: number;
  posMerchantMode?: boolean;
  riskSessionId?: string;
  shopUserSession?: string;
  totalCreditCost?: number;
}

export interface NodePaymentDetailsResponseInterface {
  chargeId: string;
  iban: string;
  annualPercentageRate?: string;
  mandateReference: string;
  mandateUrl: string;
  sourceId: string;
}

export interface NodePaymentDetailsInterface
  extends FormRatesMainInterface,
  FormRatesCheckboxes1Interface,
  FormRatesDataInterface {
}
