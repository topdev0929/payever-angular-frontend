import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { PaymentEditConfig } from '../../../models';

export const SANTANDER_DE_POS_VARIANT_CONFIG: PaymentEditConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-de-pos/edit')
        .then(m => m.SantanderDePosEditModule),
  },
};
