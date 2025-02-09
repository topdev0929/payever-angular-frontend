import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const SWEDBANK_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/swedbank/inquiry')
        .then(m => m.SwedbankInquiryModule),
  },
};
