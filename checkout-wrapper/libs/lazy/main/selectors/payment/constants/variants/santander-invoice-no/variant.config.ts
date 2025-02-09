import { PaymentDetailsVariantConfig } from '@pe/checkout/payment';
import { PaymentMethodVariantEnum } from '@pe/checkout/types';

export const SANTANDER_INVOICE_NO_VARIANT_CONFIG: PaymentDetailsVariantConfig = {
  [PaymentMethodVariantEnum.Default]: {
    import: () =>
      import('@pe/checkout/santander-no-invoice')
        .then(m => m.SantanderNoInvoiceModule),
  },
};
