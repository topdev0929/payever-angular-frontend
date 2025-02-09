export interface CreditInterface {
  amount: number;
  annualPercentageRate: number;
  duration: number;
  interest: number; // totalInterest in past
  interestRate: number; // nominalInterestRate in past
  lastMonthPayment: number; // lastRate in past
  monthlyPayment: number; // monthlyRate in past
  totalCreditCost: number; // total in past
}
