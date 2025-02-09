import { cloneDeep } from '@pe/checkout/utils';

import { CommodityGroups, EmploymentChoice, PaymentDataInterface } from '../../shared/types';

export const paymentDataFixture: () => PaymentDataInterface = () => cloneDeep({
  credit_due_date: 1,
  dateOfBirth: '1989-02-09T00:00:00.000+00:00',
  freelancer: false,
  employment: EmploymentChoice.EMPLOYEE,
  amount: 1000,
  cpi: false,
  down_payment: 0,
  commodity_group: CommodityGroups.NOT_SELECTED,
});

