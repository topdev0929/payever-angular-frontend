import { CheckoutAndCreditsInterface } from '@pe/checkout/types';

import { CreditInterface } from '../../lib/models';

export const ratesFixture: () => CheckoutAndCreditsInterface<CreditInterface> = () => ({
  currency: 'EUR',
  rates: [
    {
      campaignCode: 'campaign-code',
      creditPurchase: 500,
      description: 'description',
      duration: 4,
      effectiveRate: 500,
      isFixedAmount: true,
      isInterestFree: false,
      monthlyAmount: 12000,
      title: 'fixed-amount',
    },
    {
      campaignCode: 'campaign-code',
      creditPurchase: 500,
      description: 'description 3, 5.5',
      duration: 4,
      effectiveRate: 500,
      isFixedAmount: false,
      isInterestFree: false,
      monthlyAmount: 12000,
      title: 'title',
    },
  ],
});
