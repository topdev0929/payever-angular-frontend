import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const SANTANDER_NL_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-nl')
        .then(m => m.SantanderNlModule),
  },
};
