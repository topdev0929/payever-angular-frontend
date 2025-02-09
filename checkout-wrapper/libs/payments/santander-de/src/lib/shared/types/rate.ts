export interface BaseRateInterface {
  id?: string
  duration: number;
  dateOfFirstInstalment: string;
  subsequentInstalment: number;
  lastInstalment: number;
  cpiTotal: number;
  cpiTariff: number;
  effectiveRateOfInterest: number;
  effectiveRateOfInterestBank: number;
  loanAmount: number;
  totalLoan: number;
  loanFee: number;
  processingFee: number;
  processingFeePercentage: number;
  interestPa: number;
}

export interface BaseRateSpecificDataInterface {
  firstInstalment: number,
  processingFee: number,
  rsvTotal: number,
}

export interface RateCalculateParamsInterface {
  amount: number,
  cpi: boolean,
  dayOfFirstInstallment: number,
  freelance: boolean,
  downPayment?: number,
  dateOfBirth?: Date,
  employment?: string,
}

export interface TranslateConfigInterface {
  duration: number,
  label: string,
}

export interface RateInterface {
  amount: number;
  interestRate: number;
  duration: number;
  dateOfFirstInstalment: string;
  totalCreditCost: number;
  interest: number;
  monthlyPayment: number;
  lastMonthPayment: number;
  annualPercentageRate: number;
  specificData: RateSpecificData;
}

export interface RatesDataInterface {
  rates: RateInterface[],
  cpiRates: RateInterface[],
}

export interface RateSpecificData {
  firstInstalment: number;
  processingFee: number;
  rsvTotal: number;
  rsvTariff: number;
}
