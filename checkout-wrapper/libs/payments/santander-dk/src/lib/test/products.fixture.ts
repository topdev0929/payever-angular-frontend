import { cloneDeep } from '@pe/checkout/utils';

import { ProductInterface } from '../shared';

export const productsFixture: () => ProductInterface[] = () => cloneDeep<ProductInterface[]>([
  {
    accountFee: 50.0,
    establishmentFee: 150.0,
    id: 1,
    isSafeInsuranceAllowed: true,
    minMonth: 12,
    maxMonth: 60,
    minAmount: 5000.0,
    maxAmount: 50000.0,
    name: 'Test name',
    nominalInterest: 5.0,
    effectiveInterest: 5.5,
    safeInsurancePercentOfMonthlyPayment: 1.0,
    isSelected: false,
    paymentFreePeriod: {
      interestRate: 3.5,
      payInstallments: true,
      termsInMonths: 6,
      payLaterType: false,
    },
  },
]);
