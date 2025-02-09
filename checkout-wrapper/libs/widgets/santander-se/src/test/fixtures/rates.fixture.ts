import { CheckoutAndCreditsInterface } from '@pe/checkout/types';

import { CreditInterface } from '../../lib/models';

export const ratesFixture: () => CheckoutAndCreditsInterface<CreditInterface> = () => ({
  currency: 'EUR',
  rates: [
    {
      annualFee: 0,
      baseInterestRate: 0,
      billingFee: 0,
      code: '3006',
      effectiveInterest: 1.34,
      maxAmount: 100000,
      minAmount: 1,
      monthlyCost: 8378,
      months: 6,
      payLaterType: true,
      startupFee: 195,
      totalCost: 50465,
    },
    {
      annualFee: 0,
      baseInterestRate: 0,
      billingFee: 30,
      code: '5212',
      effectiveInterest: 2.44,
      maxAmount: 100000,
      minAmount: 3000,
      monthlyCost: 4219,
      months: 12,
      payLaterType: false,
      startupFee: 295,
      totalCost: 50925,
    },
  ],
});
