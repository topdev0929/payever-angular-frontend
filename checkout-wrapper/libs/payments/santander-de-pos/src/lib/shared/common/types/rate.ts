export type SelectedRateDataInterface = {
  creditDurationInMonths?: number;
};

export type RatesFormInterface = SelectedRateDataInterface & {
  desiredInstalment?: number;
  _desiredInstalmentView?: number;
  _rate?: string;
};

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

export interface RateDataInterface {
  raw: RateInterface;
  total: number;
  downPayment: number;
}

export interface SelectedInterface {
  rate: RateInterface;
  data: SelectedRateDataInterface;
}

export interface RatesDataInterface {
  rates: RateInterface[];
  cpiRates: RateInterface[];
}

export interface RateSpecificData {
  firstInstalment: number;
  processingFee: number;
  rsvTotal: number;
  rsvTariff: number;
}
