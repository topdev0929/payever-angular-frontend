import { cloneDeep } from '@pe/checkout/utils';

import { FormInterface } from '../shared';

export const paymentFormFixture: () => FormInterface = () => cloneDeep<FormInterface>({
  detailsForm: {
    phone: '+4923023023',
  },
});
