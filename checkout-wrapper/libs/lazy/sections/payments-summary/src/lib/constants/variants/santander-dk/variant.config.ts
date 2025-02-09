import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { PaymentSummaryConfig } from '../../../models';

export const SANTANDER_DK_VARIANT_CONFIG: PaymentSummaryConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-dk/rates-view')
        .then(m => m.SantanderDkRatesViewModule),
  },
};
