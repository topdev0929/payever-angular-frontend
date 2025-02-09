import { cloneDeep } from '@pe/checkout/utils';

import { RateInterface } from '../../shared/types';

export const rateFixture: () => RateInterface = () => cloneDeep<RateInterface>({
  'id': '1000',
  'amount': 1000,
  'annualPercentageRate': 7.9,
  'duration': 9,
  'interest': 32.03,
  'interestRate': 6.243,
  'lastMonthPayment': 114.67,
  'monthlyPayment': 114.67,
  'downPayment': 200,
  'specificData': {
    'firstInstalment': 114.67,
    'processingFee': 0,
    'rsvTotal': 0,
  },
  'totalCreditCost': 1032.03,
});

