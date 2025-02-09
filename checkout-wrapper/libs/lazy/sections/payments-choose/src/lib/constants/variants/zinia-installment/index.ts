import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const ZINIA_INSTALLMENTS_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
    import('@pe/checkout/zinia-installments/v1/choose-payment')
        .then(m => m.ZiniaInstallmentsV1ChoosePaymentModule),
  },
  [PaymentMethodVariantEnum.VariantTwo]: {
    import: () =>
      import('@pe/checkout/zinia-installments/v2/choose-payment')
        .then(m => m.ZiniaInstallmentsV2ChoosePaymentModule),
  },
};
