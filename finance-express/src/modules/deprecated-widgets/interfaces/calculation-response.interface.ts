/**
 * Response of endpoint
 * https://checkout-php.devpayever.com/api/rest/v3/service/BUSINESS_UUID/PAYMENT_OPTION_ID/translated-calculation?amount=100
 */
export interface CalculationResponseInterface {
  banner_and_rate_split: CalculationBannerAndRateSplitInterface[];
  link: CalculationLinkInterface;
  button: CalculationButtonInterface;
  bubble: string;
  banner_and_rate: CalculationBannerAndRateInterface;
  credit: CreditInterface[];
}

/**
 * Script transform CalculationResponseInterface to this interface
 */
export interface CalculationDataInterface {
  id: number;
  data: CalculationResponseInterface;
}

export interface CreditInterface {
  bank_interest: number;
  cpi_amount: number;
  duration: number;
  interest_rate: number;
  monthly_rate: number;
  price: number;
  rate_pa: number;
  total_amount: number;
  first_instalment: number;
  loan_amount: number;
  loan_fee: number;
  processing_fee: number;
  initial_min_rate: number;
  interest_free_duration: number;
  is_wish_calculation: boolean;
}

export interface CalculationBannerAndRateSplitInterface {
  month_rate: string;
  duration: string;
  pay_in: string;
  deferral_charge: string;
  summary: string;
  total: string;
  monthly_amount: string;
  legal: string;
  effective_rate: string;
}

export interface CalculationBannerAndRateInterface {
  month_rate: string;
  duration: string;
  pay_in: string;
  deferral_change: string;
  summary: string;
}

export interface CalculationLinkInterface {
  text: string;
  effective_rate: string;
}

export interface CalculationButtonInterface {
  text: string;
  effective_rate: string;
}
