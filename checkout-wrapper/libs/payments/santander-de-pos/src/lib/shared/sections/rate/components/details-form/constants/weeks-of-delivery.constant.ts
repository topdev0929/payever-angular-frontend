import { SelectOptionInterface } from '@pe/checkout/types';

import { WeekOfDelivery } from '../../../../../common';

export const WEEKS_OF_DELIVERY: SelectOptionInterface[] = [
  {
    label: $localize`:@@payment-santander-de-pos.inquiry.form._weekOfDelivery_view.value.this_week:`,
    value: WeekOfDelivery.THIS_WEEK,
  },
  {
    label: $localize`:@@payment-santander-de-pos.inquiry.form._weekOfDelivery_view.value.next_week:`,
    value: WeekOfDelivery.NEXT_WEEK,
  },
  {
    label: $localize`:@@payment-santander-de-pos.inquiry.form._weekOfDelivery_view.value.other_week:`,
    value: WeekOfDelivery.OTHER_WEEK,
  },
];
