import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const ZINIA_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/zinia-bnpl/v1/inquiry')
        .then(m => m.ZiniaBNPLInquiryModule),
  },
  [PaymentMethodVariantEnum.VariantTwo]: {
    import: () =>
      import('@pe/checkout/zinia-bnpl/v2/inquiry')
        .then(m => m.ZiniaBNPLInquiryModuleV2),
  },
  v3: {
    import: () =>
      import('@pe/checkout/zinia-bnpl/v3/inquiry')
        .then(m => m.ZiniaBNPLInquiryModuleV3),
  },
  v4: {
    import: () =>
      import('@pe/checkout/zinia-bnpl/v4/inquiry')
        .then(m => m.ZiniaBNPLInquiryModuleV4),
  },
};
