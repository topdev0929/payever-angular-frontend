
import { cloneDeep } from '@pe/checkout/utils';

import { FormOptionsInterface } from '../../shared';

export const paymentOptionsFixture: () => FormOptionsInterface = () => cloneDeep<FormOptionsInterface>(
  {
    banks: [
      {
        id: 'ngp-giba',
        name: 'Erste BankAustria',
        logoUri: 'https://s3-us-west-2.amazonaws.com/tokenio-assets/1.0.0/logos/ngp-giba/ngp-giba_square.png',
      },
      {
        id: 'ngp-ntsb',
        name: 'N26',
        logoUri: 'https://s3-us-west-2.amazonaws.com/tokenio-assets/1.0.0/logos/ngp-ntsb/ngp-ntsb_square.png',
      },
      {
        id: 'ngp-rvvg',
        name: 'Raiffeisen',
        logoUri: 'https://s3-us-west-2.amazonaws.com/tokenio-assets/1.0.0/logos/ngp-rvvg/ngp-rvvg_square.png',
      },
      {
        id: 'ob-wise-eea',
        name: 'Wise',
        logoUri: 'https://s3-us-west-2.amazonaws.com/tokenio-assets/1.0.0/logos/ob-wise-eea/ob-wise-eea_square.png',
      },
    ],
  });
