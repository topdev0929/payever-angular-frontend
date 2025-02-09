import { PaymentDetailsVariantConfig } from '@pe/checkout/payment';
import { PaymentMethodVariantEnum } from '@pe/checkout/types';

export const ZINIA_VARIANT_CONFIG: PaymentDetailsVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/zinia-bnpl/v1/payment-details')
        .then(m => m.ZiniaBNPLPaymentDetailsModule),
  },
  [PaymentMethodVariantEnum.VariantTwo]: {
    import: () =>
      import('@pe/checkout/zinia-bnpl/v2/payment-details')
        .then(m => m.ZiniaBNPLPaymentDetailsModule),
  },
  v3: {
    import: () =>
      import('@pe/checkout/zinia-bnpl/v3/payment-details')
        .then(m => m.ZiniaBNPLPaymentDetailsModule),
  },
  v4: {
    import: () =>
      import('@pe/checkout/zinia-bnpl/v4/payment-details')
        .then(m => m.ZiniaBNPLPaymentDetailsModule),
  },
};
