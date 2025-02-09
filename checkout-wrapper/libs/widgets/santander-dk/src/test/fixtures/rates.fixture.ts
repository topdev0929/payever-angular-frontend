import { CheckoutAndCreditsInterface } from '@pe/checkout/types';

import { CreditInterface } from '../../lib/models';

export const ratesFixture: () => CheckoutAndCreditsInterface<CreditInterface> = () => ({
  currency: 'EUR',
  rates: [
    {
      parameters: {
        loanAmount: 31000,
        establishmentFee: 0,
        loanDurationInMonths: 12,
        nominalInterest: 14.95,
        effectiveInterest: 16.02,
        monthlyAdministrationFee: 0,
        paymentFreeDuration: 0,
        paymentFreeIntrest: 0,
        paymentFreePayInstallments: false,
        startDate: '2024-04-01T08:24:42.1181099+02:00',
      },
      result: {
        termsInMonth: 12,
        annuallyProcent: 15.78,
        totalCost: 2529,
        totalLoanAmount: 33529,
        monthlyPayment: 2795,
        paymentFreeDuration: 0,
      },
      isDefault: true,
      payLaterType: false,
      interestFreeType: false,
    },
  ],
});
