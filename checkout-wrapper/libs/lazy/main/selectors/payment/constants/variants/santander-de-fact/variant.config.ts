import { PaymentDetailsVariantConfig } from '@pe/checkout/payment';
import { PaymentMethodVariantEnum } from '@pe/checkout/types';

export const SANTANDER_DE_FACT_VARIANT_CONFIG: PaymentDetailsVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-de-fact/inquiry')
        .then(m => m.SantanderFactDeInquiryModule),
  },
};

export const SANTANDER_DE_FACT_POS_VARIANT_CONFIG: PaymentDetailsVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-de-fact/inquiry-pos')
        .then(m => m.SantanderFactDePosInquiryModule),
  },
};
