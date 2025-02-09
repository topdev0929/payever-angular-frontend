import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const SANTANDER_DE_FACT_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-de-fact/rates')
        .then(m => m.SantanderFactDeRatesModule),
  },
};

export const SANTANDER_DE_FACT_POS_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-de-fact/rates-pos')
        .then(m => m.SantanderFactDePosRatesModule),
  },
};
