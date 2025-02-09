export interface RateInterface {
  amount: number;
  interestRate: number;
  duration: number;
  totalCreditCost: number;
  interest: number;
  monthlyPayment: number;
  lastMonthPayment: number;
  annualPercentageRate: number;
  specificData: RateSpecificData;
}

export interface RateSpecificData {
  downPayment?: number;
  firstMonthPayment: number;
  flatRate: number;
}
