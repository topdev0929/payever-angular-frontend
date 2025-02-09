import { FormOptionsInterface } from '@pe/checkout/santander-de-pos/shared';
import { cloneDeep } from '@pe/checkout/utils';

import { MERCHANT_DEFAULT_CONDITION } from '../../shared/sections/rate/constants';

export const paymentOptionsFixture: () => FormOptionsInterface = () => cloneDeep<FormOptionsInterface>(
  {
    commodityGroups: [],
    conditions: [
      {
        description: 'condition-description-01',
        programs: [{
          key: 'condition-key-01',
          program: 'condition-program-01',
        }],
        isComfortCardCondition: true,
      },
      {
        description: 'condition-description-02',
        programs: [{
          key: 'condition-key-02',
          program: 'condition-program-02',
        }],
        isComfortCardCondition: true,
      },
      {
        description: MERCHANT_DEFAULT_CONDITION,
        programs: [
          {
            key: 'condition-key-03',
            program: 'condition-program-03',
          },
          {
            key: 'condition-key-04',
            program: 'condition-program-04',
          },
        ],
        isComfortCardCondition: true,
      },
    ],
    defaultCondition: MERCHANT_DEFAULT_CONDITION,
    professions: [],
    isDownPaymentAllowed: true,
    nationalities: [
      {
        label: 'Germany',
        value: 'DE',
      },
    ],
    maritalStatuses: [{
      label: 'status-01',
      value: 1,
    }],
    guarantorRelations: [],
    residentialTypes: [],
    identifications: [
      {
        label: 'name',
        value: 'name',
      },
      {
        label: 'passport',
        value: 'PASSPORT',
      },
    ],
  });
