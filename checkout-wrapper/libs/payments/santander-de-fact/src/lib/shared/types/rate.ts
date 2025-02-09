import { NodePaymentInterface } from '@pe/checkout/types';

import { NodeSetupRateInterface } from './payment-data';

export interface RatesInitializeDataInterface {
  conditionsAccepted: boolean;
  advertisingAccepted: boolean;
  birthday: string;

  initializeUniqueId: string;
  // initializeStatusCode: string;
  annualPercentageRate: number;
  // redirectAmount: number;
}

export interface RateInterface {
  duration: number;
  amount: number;
  interest: number;
  totalCreditCost: number;
  annualPercentageRate: number;
  interestRate: number;
  monthlyPayment: number;
  lastMonthPayment: number;
}

export interface RatesDataInterface {
  data: NodePaymentInterface<NodeSetupRateInterface>;
  rates: RateInterface[];
}
