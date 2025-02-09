import { cloneDeep } from '@pe/checkout/utils';

import { FormOptionsInterface, MERCHANT_DEFAULT_CONDITION, SELF_DEFAULT_CONDITION } from '../../shared';

export const paymentOptionFixture = () => cloneDeep<FormOptionsInterface> ({
    conditions: [
      {
        description: MERCHANT_DEFAULT_CONDITION,
        isComfortCardCondition: true,
        programs: [
          {
            key: 'key',
            program: 'program',
          },
        ],
      },
      {
        description: SELF_DEFAULT_CONDITION,
        isComfortCardCondition: false,
        programs: [
          {
            key: 'key',
            program: 'program',
          },
        ],
      },
    ],
    commodityGroups: [],
    defaultCondition: '',
    guarantorRelations: [],
    identifications: [],
    isDownPaymentAllowed: true,
    maritalStatuses: [],
    nationalities: [],
    professions: [
        {
            label: 'label',
            value: 'value',
        },
    ],
    residentialTypes: [],
});
