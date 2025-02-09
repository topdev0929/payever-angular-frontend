import { PaymentDetailsVariantConfig } from '@pe/checkout/payment';
import { PaymentMethodVariantEnum } from '@pe/checkout/types';

export const STRIPE_DIRECTDEBIT_VARIANT_CONFIG: PaymentDetailsVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/stripe-directdebit/payment-details')
        .then(m => m.StripeDirectdebitDetailsModule),
  },
};
