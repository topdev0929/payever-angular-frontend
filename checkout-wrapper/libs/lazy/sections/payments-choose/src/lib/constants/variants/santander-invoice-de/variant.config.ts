import { PaymentMethodVariantEnum } from '@pe/checkout/types';

import { ChoosePaymentVariantConfig } from '../../../models';

export const SANTANDER_DE_INVOICE_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-de-invoice/rates')
        .then(m => m.SantanderDeInvoiceRatesModule),
  },
};

export const SANTANDER_DE_INVOICE_POS_VARIANT_CONFIG: ChoosePaymentVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-de-invoice/rates-pos')
        .then(m => m.RatesModule),
  },
};
