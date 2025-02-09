import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const IVY_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/ivy/choose-payment/default')
        .then(m => m.IvyChoosePaymentModule),
  },
  [PaymentMethodVariantEnum.VariantTwo]: {
    import: () =>
      import('@pe/checkout/ivy/choose-payment/v2')
        .then(m => m.IvyChoosePaymentModule),
  },
};
