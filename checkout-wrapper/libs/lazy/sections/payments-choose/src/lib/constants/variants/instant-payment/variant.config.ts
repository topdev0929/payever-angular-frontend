import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const INSTANT_PAYMENT_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/instant-payment/inquiry')
        .then(m => m.InstantPaymentInquiryModule),
  },
};
