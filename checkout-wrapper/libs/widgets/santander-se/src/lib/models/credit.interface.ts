export interface CreditInterface {
  annualFee: number;
  baseInterestRate: number;
  billingFee: number;
  code: string;
  effectiveInterest: number;
  maxAmount: number;
  minAmount: number;
  monthlyCost: number;
  months: number;
  payLaterType: boolean;
  startupFee: number;
  totalCost: number;
}
