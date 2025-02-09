import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const SANTANDER_AT_INSTANT_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-at-instant/v1/inquiry')
        .then(m => m.SantanderAtInstantInquiryModule),
  },
  [PaymentMethodVariantEnum.VariantTwo]: {
    import: () =>
      import('@pe/checkout/santander-at-instant/v2/inquiry')
        .then(m => m.SantanderAtInstantInquiryModule),
  },
} as ChoosePaymentVariantConfig;

