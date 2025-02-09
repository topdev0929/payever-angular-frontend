import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const ALLIANZ_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/allianz/inquiry')
        .then(m => m.AllianzInquiryModule),
  },
};
