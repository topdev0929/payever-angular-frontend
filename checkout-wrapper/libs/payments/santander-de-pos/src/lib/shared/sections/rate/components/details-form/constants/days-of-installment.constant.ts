import { SelectOptionInterface } from '@pe/checkout/types';

import { DayOfFirstInstalment } from '../../../../../common';

export const DAYS_OF_INSTALLMENT: SelectOptionInterface[] = [
  {
    label: $localize`:@@payment-santander-de-pos.inquiry.form.dayOfFirstInstalment.value.15:`,
    value: DayOfFirstInstalment.FIFTEENTH_DAY,
  },
  {
    label: $localize`:@@payment-santander-de-pos.inquiry.form.dayOfFirstInstalment.value.1:`,
    value: DayOfFirstInstalment.FIRST_DAY,
  },
];
