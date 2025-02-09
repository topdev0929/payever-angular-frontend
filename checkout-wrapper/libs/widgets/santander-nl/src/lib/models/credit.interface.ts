export interface CreditSpecificData {
  firstInstallment: number;
  processingFee: number;
  rsvTotal: number;
}

export interface CreditInterface {
  amount: number;
  annualPercentageRate: number;
  duration: number;
  interestRate: number;
  isDefault: boolean;
  monthlyPayment: number;
  totalCreditCost: number;
}
