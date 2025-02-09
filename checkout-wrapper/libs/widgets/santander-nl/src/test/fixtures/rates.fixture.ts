import { CheckoutAndCreditsInterface } from '@pe/checkout/types';

import { CreditInterface } from '../../lib/models';

export const ratesFixture: () => CheckoutAndCreditsInterface<CreditInterface> = () => ({
  currency: 'EUR',
  rates: [
    {
      amount: 50049.5,
      annualPercentageRate: 12,
      duration: 12,
      interestRate: 8.85,
      isDefault: true,
      monthlyPayment: 4432.49,
      totalCreditCost: 53189.88,
    },
    {
      amount: 50049.5,
      annualPercentageRate: 12,
      duration: 24,
      interestRate: 4.67,
      isDefault: false,
      monthlyPayment: 2341.69,
      totalCreditCost: 56200.56,
    },
  ],
});
