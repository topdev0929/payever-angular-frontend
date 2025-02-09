import { cloneDeep } from '@pe/checkout/utils';

import { FormInterface } from '../../shared';

export const paymentFormFixture: () => FormInterface = () => cloneDeep<FormInterface>({
  duration: 12,
  downPayment: 1200,
  interestRate: 12,
  flatRate: 14,
  monthlyPayment: 120,
  firstMonthPayment: 120,
  lastMonthPayment: 140,
  interest: 10,
  totalCreditCost: 20,
  amount: 1400,
  _deposit_view: 30,
});
