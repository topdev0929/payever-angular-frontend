export interface RateInterface {
  isDefault: boolean;
  payLaterType?: boolean; // if true then it is a bnpl rate, otherwise standard one
  payLaterTitle?: string; // title for bnpl rate, empty for regular rate
  interestFreeType?: boolean;
  parameters: RateParametersInterface;
  result: RateResultInterface;
}

interface RateParametersInterface {
  establishmentFee: number;
  loanAmount: number;
  loanDurationInMonths: number;
  monthlyAdministrationFee: number;
  nominalInterest: number;
  effectiveInterest: number;
  paymentFreeDuration: number;
  paymentFreeIntrest: number;
  paymentFreePayInstallments: boolean;
}

interface RateResultInterface {
  annuallyProcent: number;
  monthlyPayment: number;
  paymentFreeDuration: number;
  termsInMonth: number;
  totalCost: number;
  totalLoanAmount: number;
}
