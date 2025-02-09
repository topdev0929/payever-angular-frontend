import { PaymentDetailsVariantConfig } from '@pe/checkout/payment';
import { PaymentMethodVariantEnum } from '@pe/checkout/types';

export const ZINIA_INSTALLMENTS_VARIANT_CONFIG: PaymentDetailsVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/zinia-installments/v1/payment-details')
        .then(m => m.ZiniaInstallmentsV1PaymentDetailsModule),
  },
  [PaymentMethodVariantEnum.VariantTwo]: {
    import: () =>
      import('@pe/checkout/zinia-installments/v2/payment-details')
        .then(m => m.ZiniaInstallmentsV2PaymentDetailsModule),
  },
};
