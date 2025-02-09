import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const WIRETRANSFER_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/wiretransfer')
        .then(m => m.WiretransferModule),
  },
};
