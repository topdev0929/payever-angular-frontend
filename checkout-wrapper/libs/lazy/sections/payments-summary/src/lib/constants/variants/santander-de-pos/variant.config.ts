import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { PaymentSummaryConfig } from '../../../models';

export const SANTANDER_DE_POS_VARIANT_CONFIG: PaymentSummaryConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-de-pos/rates')
        .then(m => m.SantanderDePosRatesModule),
  },
};
