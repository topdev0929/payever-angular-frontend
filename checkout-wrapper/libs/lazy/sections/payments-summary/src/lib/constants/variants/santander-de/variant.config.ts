import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { PaymentSummaryConfig } from '../../../models';

export const SANTANDER_DE_VARIANT_CONFIG: PaymentSummaryConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-de')
        .then(m => m.SantanderDeModule),
  },
};
