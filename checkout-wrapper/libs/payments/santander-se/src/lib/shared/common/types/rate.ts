import { SelectedRateDataInterface } from './form';

export interface RateInterface {
  annualFee: number;
  baseInterestRate: number;
  billingFee: number;
  code: string;
  effectiveInterest: number;
  monthlyCost: number;
  months: number;
  payLaterType: boolean;
  startupFee: number;
  totalCost: number;
}

export interface SelectedInterface {
  rate: RateInterface;
  data: SelectedRateDataInterface;
}
