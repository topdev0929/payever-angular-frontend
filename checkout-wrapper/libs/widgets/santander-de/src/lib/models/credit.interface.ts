export interface CreditSpecificData {
  firstInstallment: number;
  processingFee: number;
  rsvTotal: number;
}

export interface CreditInterface {
  amount: number;
  annualPercentageRate: number;
  duration: number;
  interest: number;
  interestRate: number;
  lastMonthPayment: number;
  monthlyPayment: number;
  specificData: CreditSpecificData;
  totalCreditCost: number;
}
