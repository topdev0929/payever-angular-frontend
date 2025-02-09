import { PaymentMethodVariantEnum } from '../enums';

export type PaymentVariantConfig<PaymentModule> = {
  [variant in PaymentMethodVariantEnum]?: {
    import: () => Promise<PaymentModule>;
  }
};
