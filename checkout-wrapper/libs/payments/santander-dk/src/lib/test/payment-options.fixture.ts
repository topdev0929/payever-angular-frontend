import { cloneDeep } from '@pe/checkout/utils';

import { FormOptionsInterface } from '../shared';

export const paymentOptionsFixture: () => FormOptionsInterface = () => cloneDeep<FormOptionsInterface>({
  carsFinancedTypes: [
    { label: 'label.0', value: 0 },
    { label: 'label.1', value: 1 },
  ],
  carsAges: [
    { label: 'label-0', value: 0 },
    { label: 'label-1', value: 1 },
  ],
  maritalStatuses: [
    { label: 'label-0', value: 0 },
    { label: 'label-1', value: 1 },
  ],
  citizenshipTypes: [
    { label: 'label-0', value: 0 },
    { label: 'label-1', value: 1 },
  ],
  residencePermitTypes: [
    { label: 'label-0', value: 0 },
    { label: 'label-1', value: 1 },
  ],
  employmentTypes: [
    { label: 'label-0', value: 0 },
    { label: 'label-1', value: 1 },
  ],
  residentialTypes: [
    { label: 'label-0', value: 0 },
    { label: 'label-1', value: 1 },
  ],
  paySources: [
    { label: 'label-0', value: 0 },
    { label: 'label-1', value: 1 },
  ],
});
