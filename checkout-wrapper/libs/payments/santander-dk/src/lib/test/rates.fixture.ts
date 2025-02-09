import { cloneDeep } from '@pe/checkout/utils';

import { RateInterface } from '../shared';

export const ratesFixture: () => RateInterface[] = () => cloneDeep < RateInterface[]> ([
  {
    isDefault: true,
    parameters: {
      establishmentFee: 100,
      loanAmount: 200,
      loanDurationInMonths: 3,
      monthlyAdministrationFee: 100,
      nominalInterest: 10,
      effectiveInterest: 10,
      paymentFreeDuration: 10,
      paymentFreeIntrest: 10,
      paymentFreePayInstallments: true,
    },
    result: {
      annuallyProcent: 10,
      monthlyPayment: 10,
      paymentFreeDuration: 10,
      termsInMonth: 10,
      totalCost: 1000,
      totalLoanAmount: 100,
    },
  },
  {
    isDefault: false,
    parameters: {
      establishmentFee: 110,
      loanAmount: 210,
      loanDurationInMonths: 5,
      monthlyAdministrationFee: 110,
      nominalInterest: 11,
      effectiveInterest: 11,
      paymentFreeDuration: 11,
      paymentFreeIntrest: 11,
      paymentFreePayInstallments: true,
    },
    result: {
      annuallyProcent: 11,
      monthlyPayment: 11,
      paymentFreeDuration: 11,
      termsInMonth: 11,
      totalCost: 1100,
      totalLoanAmount: 110,
    },
  },
  {
    isDefault: false,
    payLaterType: true,
    payLaterTitle: 'Buy Now Pay Later',
    parameters: {
      establishmentFee: 120,
      loanAmount: 220,
      loanDurationInMonths: 6,
      monthlyAdministrationFee: 150,
      nominalInterest: 12,
      effectiveInterest: 12,
      paymentFreeDuration: 12,
      paymentFreeIntrest: 12,
      paymentFreePayInstallments: false,
    },
    result: {
      annuallyProcent: 12,
      monthlyPayment: 12,
      paymentFreeDuration: 12,
      termsInMonth: 12,
      totalCost: 1200,
      totalLoanAmount: 120,
    },
  },
]);
