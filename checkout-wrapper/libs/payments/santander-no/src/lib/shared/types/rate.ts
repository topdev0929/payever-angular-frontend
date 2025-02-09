import { SelectedRateDataInterface } from './form';

export interface RateInterface {
  title: string;
  description: string;
  campaignCode: string;
  creditPurchase: number;
  duration: number;
  effectiveRate: number;
  isInterestFree: boolean;
  isFixedAmount: boolean;
  monthlyAmount: number;
}

export interface SelectedInterface {
  rate: RateInterface;
  data: SelectedRateDataInterface;
}

