import { cloneDeep } from '@pe/checkout/utils';

import { RateInterface } from '../../shared/types';

export const rateFixture: () => RateInterface = () => cloneDeep<RateInterface>({
  'amount': 4000,
  'annualPercentageRate': 0,
  'dateOfFirstInstalment': '2024-07-15',
  'duration': 6,
  'interest': 0,
  'interestRate': 0,
  'lastMonthPayment': 666.7,
  'monthlyPayment': 666.66,
  'specificData': {
    'firstInstalment': 666.66,
    'processingFee': 0,
    'rsvTariff': null,
    'rsvTotal': 0,
  },
  'totalCreditCost': 4000,
});
