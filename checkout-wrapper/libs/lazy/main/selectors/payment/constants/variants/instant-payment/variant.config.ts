import { PaymentDetailsVariantConfig } from '@pe/checkout/payment';
import { PaymentMethodVariantEnum } from '@pe/checkout/types';

export const INSTANT_PAYMENT_VARIANT_CONFIG: PaymentDetailsVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/instant-payment')
        .then(m => m.InstantPaymentModule),
  },
};
