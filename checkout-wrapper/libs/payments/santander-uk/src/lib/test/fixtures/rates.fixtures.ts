import { cloneDeep } from '@pe/checkout/utils';

import { RateInterface } from '../../shared';

export const ratesFixture = () => cloneDeep<RateInterface[]>([
  {
    duration: 12,
    annualPercentageRate: 0.5,
    interestRate: 4.8,
    interest: 4,
    lastMonthPayment: 400,
    monthlyPayment: 500,
    amount: 10000,
    totalCreditCost: 11000,
    specificData: {
      downPayment: 300,
      firstMonthPayment: 1000,
      flatRate: 100,
    },
  },
  {
    duration: 24,
    annualPercentageRate: 0.25,
    interestRate: 4.8,
    interest: 4,
    lastMonthPayment: 400,
    monthlyPayment: 500,
    amount: 10000,
    totalCreditCost: 10500,
    specificData: {
      downPayment: 200,
      firstMonthPayment: 900,
      flatRate: 90,
    },
  },
]);
