import { PaymentDetailsVariantConfig } from '@pe/checkout/payment';
import { PaymentMethodVariantEnum } from '@pe/checkout/types';

export const WIRETRANSFER_VARIANT_CONFIG: PaymentDetailsVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/wiretransfer')
        .then(m => m.WiretransferModule),
  },
};
