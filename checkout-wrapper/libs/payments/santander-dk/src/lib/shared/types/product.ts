
export interface ProductInterface {
  accountFee: number;
  establishmentFee: number;
  id: number;
  isSafeInsuranceAllowed: boolean;
  minMonth: number;
  maxMonth: number;
  minAmount: number;
  maxAmount: number;
  name: string;
  nominalInterest: number;
  effectiveInterest: number;
  safeInsurancePercentOfMonthlyPayment: number;
  isSelected: boolean; // TODO Must be prefixed with _ ?
  paymentFreePeriod: {
    interestRate: number;
    payInstallments: boolean;
    termsInMonths: number;
    payLaterType: boolean;
  };
}
