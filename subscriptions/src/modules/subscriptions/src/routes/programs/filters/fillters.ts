import { PeDataGridFilter } from '@pe/common';

export const filters: PeDataGridFilter[] = [
  {
    title: 'Program',
    items: [
      {
        title: 'Standard',
        key: 'standard-program',
        selected: true,
      },
      {
        title: 'Plus',
        key: 'plus-program',
        selected: false,
      },
      {
        title: 'Pro',
        key: 'pro-program',
        selected: false,
      },
      {
        title: 'Enterprise',
        key: 'enterprise-program',
        selected: false,
      },
    ],
  },
];
