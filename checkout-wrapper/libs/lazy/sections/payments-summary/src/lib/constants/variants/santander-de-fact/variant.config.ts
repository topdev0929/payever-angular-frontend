import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { PaymentSummaryConfig } from '../../../models';

export const SANTANDER_DE_FACT_VARIANT_CONFIG: PaymentSummaryConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-de-fact/rates-view')
        .then(m => m.SantanderFactDeRatesViewModule),
  },
};
