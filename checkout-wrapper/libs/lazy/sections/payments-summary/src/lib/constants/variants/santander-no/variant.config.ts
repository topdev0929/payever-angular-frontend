import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { PaymentSummaryConfig } from '../../../models';

export const SANTANDER_NO_VARIANT_CONFIG: PaymentSummaryConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-no/rates-view')
        .then(m => m.SantanderNoRatesViewModule),
  },
};
