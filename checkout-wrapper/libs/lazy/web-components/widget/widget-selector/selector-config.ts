import { Type } from '@angular/core';

import type { AbstractBaseWidgetModule } from '@pe/checkout/payment-widgets';
import { PaymentWidgetEnum } from '@pe/checkout/types';

export const WIDGET_SELECTOR_TYPES: {
  [key in PaymentWidgetEnum]: { import: () => Promise<Type<AbstractBaseWidgetModule>> }
} = {
  [PaymentWidgetEnum.SANTANDER_INSTALLMENT_AT]: {
    import: () => import('@pe/widget/santander-at').then(m => m.SantanderAtWidgetModule),
  },
  [PaymentWidgetEnum.SANTANDER_INSTALLMENT]: {
    import: () => import('@pe/widget/santander-de').then(m => m.SantanderDeWidgetModule),
  },
  [PaymentWidgetEnum.SANTANDER_FACTORING_DE]: {
    import: () => import('@pe/widget/santander-de-fact').then(m => m.SantanderFactDeWidgetModule),
  },
  [PaymentWidgetEnum.SANTANDER_INSTALLMENT_DK]: {
    import: () => import('@pe/widget/santander-dk').then(m => m.SantanderDkWidgetModule),
  },
  [PaymentWidgetEnum.SANTANDER_INSTALLMENT_NL]: {
    import: () => import('@pe/widget/santander-nl').then(m => m.SantanderNlWidgetModule),
  },
  [PaymentWidgetEnum.SANTANDER_INSTALLMENT_NO]: {
    import: () => import('@pe/widget/santander-no').then(m => m.SantanderNoWidgetModule),
  },
  [PaymentWidgetEnum.SANTANDER_INSTALLMENT_SE]: {
    import: () => import('@pe/widget/santander-se').then(m => m.SantanderSeWidgetModule),
  },
  [PaymentWidgetEnum.IVY]: {
    import: () => import('@pe/widget/ivy').then(m => m.IvyWidgetModule),
  },
  [PaymentWidgetEnum.GOOGLE_PAY]: {
    import: () => import('@pe/widget/stripe-wallet').then(m => m.StripeWalletModule),
  },
  [PaymentWidgetEnum.APPLE_PAY]: {
    import: () => import('@pe/widget/stripe-wallet').then(m => m.StripeWalletModule),
  },
  [PaymentWidgetEnum.ZINIA_INSTALLMENT]: {
    import: () => import('@pe/widget/zinia-installments').then(m => m.ZiniaInstallmentsWidgetModule),
  },
  [PaymentWidgetEnum.ZINIA_INSTALLMENT_DE]: {
    import: () => import('@pe/widget/zinia-installments').then(m => m.ZiniaInstallmentsWidgetModule),
  },
};
