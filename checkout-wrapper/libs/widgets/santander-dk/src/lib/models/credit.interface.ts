export interface CreditInterface {
  parameters: {
    loanAmount: number;
    establishmentFee: number;
    loanDurationInMonths: number;
    nominalInterest: number;
    effectiveInterest: number;
    monthlyAdministrationFee: number;
    paymentFreeDuration: number;
    paymentFreeIntrest: number;
    paymentFreePayInstallments: boolean;
    startDate: string;
  };
  result: {
    termsInMonth: number;
    annuallyProcent: number;
    totalCost: number;
    totalLoanAmount: number;
    monthlyPayment: number;
    paymentFreeDuration: number;
  };
  isDefault: boolean;
  payLaterType: boolean;
  interestFreeType: boolean;
}
