import { PaymentMethodEnum, PaymentMethodVariantEnum } from '@pe/checkout/types';

import type { FinishSelectorConfig } from './finish-selector.type';

export const FINISH_SELECTOR_CONFIG: FinishSelectorConfig = {
  [PaymentMethodEnum.PSA_B2B_BNPL]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/allianz/finish')
          .then(m => m.AllianzFinishModule),
    },
  },
  [PaymentMethodEnum.ALLIANZ]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/allianz/finish')
          .then(m => m.AllianzFinishModule),
    },
  },
  [PaymentMethodEnum.BFS_B2B_BNPL]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/bfs/finish')
          .then(m => m.BfsFinishModule),
    },
  },
  [PaymentMethodEnum.HSBC]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/hsbc/finish')
          .then(m => m.HsbcFinishModule),
    },
  },
  [PaymentMethodEnum.INSTANT_PAYMENT]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/instant-payment')
          .then(m => m.InstantPaymentModule),
    },
  },
  [PaymentMethodEnum.IVY]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/ivy/finish')
          .then(m => m.IvyFinishModule),
    },
    [PaymentMethodVariantEnum.VariantTwo]: {
      import: () =>
        import('@pe/checkout/ivy/finish/v2')
          .then(m => m.IvyFinishModule),
    },
  },
  [PaymentMethodEnum.CASH]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/wiretransfer')
          .then(m => m.WiretransferModule),
    },
  },
  [PaymentMethodEnum.PAYPAL]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/paypal')
          .then(m => m.PaypalModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INSTALLMENT_AT]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-at')
          .then(m => m.SantanderAtModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_AT]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-at')
          .then(m => m.SantanderAtModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INSTALLMENT_BE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-be/finish')
          .then(m => m.SantanderBeFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INSTALLMENT]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-de')
          .then(m => m.SantanderDeModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
    [PaymentMethodVariantEnum.Default]: {
      import: editMode =>
        editMode
          ? import('@pe/checkout/santander-de-pos/edit-finish')
            .then(m => m.SantanderDePosEditFinishModule)
          : import('@pe/checkout/santander-de-pos/finish')
            .then(m => m.SantanderDePosFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INVOICE_DE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-de-invoice/finish')
          .then(m => m.SantanderDeInvoiceFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_POS_INVOICE_DE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-de-invoice/finish')
          .then(m => m.SantanderDeInvoiceFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_FACTORING_DE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-de-fact/finish')
          .then(m => m.SantanderFactDeFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_POS_FACTORING_DE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-de-fact/finish')
          .then(m => m.SantanderFactDeFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-dk/finish')
          .then(m => m.SantanderDkFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_DK]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-dk/finish')
          .then(m => m.SantanderDkFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INSTALLMENT_FI]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-fi')
          .then(m => m.SantanderFiModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_FI]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-fi')
          .then(m => m.SantanderFiModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INSTALLMENT_NL]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-nl')
          .then(m => m.SantanderNlModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INSTALLMENT_NO]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-no/finish')
          .then(m => m.SantanderNoFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_NO]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-no/finish')
          .then(m => m.SantanderNoFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INVOICE_NO]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-no-invoice')
          .then(m => m.SantanderNoInvoiceModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_POS_INVOICE_NO]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-no-invoice')
          .then(m => m.SantanderNoInvoiceModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INSTALLMENT_SE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-se/finish')
          .then(m => m.SantanderSeFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_SE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-se/finish')
          .then(m => m.SantanderSeFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INSTALLMENT_UK]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-uk/finish')
          .then(m => m.SantanderUkFinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_UK]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/santander-uk/finish')
          .then(m => m.SantanderUkFinishModule),
    },
  },
  [PaymentMethodEnum.GOOGLE_PAY]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/stripe-wallet/finish')
          .then(m => m.StripeWalletFinishModule),
    },
  },
  [PaymentMethodEnum.APPLE_PAY]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/stripe-wallet/finish')
          .then(m => m.StripeWalletFinishModule),
    },
  },
  [PaymentMethodEnum.SOFORT]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/sofort')
          .then(m => m.SofortModule),
    },
  },
  [PaymentMethodEnum.STRIPE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/stripe/finish')
          .then(m => m.StripeFinishModule),
    },
  },
  [PaymentMethodEnum.STRIPE_DIRECTDEBIT]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/stripe-directdebit/finish')
          .then(m => m.StripeDirectdebitFinishModule),
    },
  },
  [PaymentMethodEnum.STRIPE_IDEAL]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/stripe-ideal/finish')
          .then(m => m.StripeIdealFinishModule),
    },
  },
  [PaymentMethodEnum.SWEDBANK_CREDITCARD]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/swedbank/finish')
          .then(m => m.SwedbankFinishModule),
    },
  },
  [PaymentMethodEnum.SWEDBANK_INVOICE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/swedbank/finish')
          .then(m => m.SwedbankFinishModule),
    },
  },
  [PaymentMethodEnum.SWEDBANK_VIPPS]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/swedbank/finish')
          .then(m => m.SwedbankFinishModule),
    },
  },
  [PaymentMethodEnum.SWEDBANK_TRUSTLY]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/swedbank/finish')
          .then(m => m.SwedbankFinishModule),
    },
  },
  [PaymentMethodEnum.SWEDBANK_MOBILE_PAY]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/swedbank/finish')
          .then(m => m.SwedbankFinishModule),
    },
  },
  [PaymentMethodEnum.SWEDBANK_SWISH]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/swedbank/finish')
          .then(m => m.SwedbankFinishModule),
    },
  },
  [PaymentMethodEnum.ZINIA_BNPL_DE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v1/finish')
          .then(m => m.ZiniaBNPLFinishModule),
    },
    [PaymentMethodVariantEnum.VariantTwo]: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v2/finish')
          .then(m => m.ZiniaBNPLFinishModuleV2),
    },
    v3: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v3/finish')
          .then(m => m.ZiniaBNPLFinishModuleV3),
    },
    v4: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v4/finish')
          .then(m => m.ZiniaBNPLFinishModuleV4),
    },
  },
  [PaymentMethodEnum.ZINIA_BNPL]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v1/finish')
          .then(m => m.ZiniaBNPLFinishModule),
    },
    [PaymentMethodVariantEnum.VariantTwo]: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v2/finish')
          .then(m => m.ZiniaBNPLFinishModuleV2),
    },
    v3: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v3/finish')
          .then(m => m.ZiniaBNPLFinishModuleV3),
    },
    v4: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v4/finish')
          .then(m => m.ZiniaBNPLFinishModuleV4),
    },
  },
  [PaymentMethodEnum.ZINIA_INSTALLMENT]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-installments/v1/finish')
          .then(m => m.ZiniaInstallmentsV1FinishModule),
    },
    [PaymentMethodVariantEnum.VariantTwo]: {
      import: () =>
        import('@pe/checkout/zinia-installments/v2/finish')
          .then(m => m.ZiniaInstallmentsV2FinishModule),
    },
  },
  [PaymentMethodEnum.ZINIA_INSTALLMENT_DE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-installments/v1/finish')
          .then(m => m.ZiniaInstallmentsV1FinishModule),
    },
    [PaymentMethodVariantEnum.VariantTwo]: {
      import: () =>
        import('@pe/checkout/zinia-installments/v2/finish')
          .then(m => m.ZiniaInstallmentsV2FinishModule),
    },
  },
  [PaymentMethodEnum.ZINIA_POS]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v1/finish')
          .then(m => m.ZiniaBNPLFinishModule),
    },
  },
  [PaymentMethodEnum.ZINIA_POS_DE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v1/finish')
          .then(m => m.ZiniaBNPLFinishModule),
    },
  },
  [PaymentMethodEnum.ZINIA_SLICE_THREE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v1/finish')
          .then(m => m.ZiniaBNPLFinishModule),
    },
  },
  [PaymentMethodEnum.ZINIA_SLICE_THREE_DE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v1/finish')
          .then(m => m.ZiniaBNPLFinishModule),
    },
  },
  [PaymentMethodEnum.ZINIA_POS_SLICE_THREE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v1/finish')
          .then(m => m.ZiniaBNPLFinishModule),
    },
  },
  [PaymentMethodEnum.ZINIA_POS_SLICE_THREE_DE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-bnpl/v1/finish')
          .then(m => m.ZiniaBNPLFinishModule),
    },
  },
  [PaymentMethodEnum.ZINIA_POS_INSTALLMENT]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-installments/v1/finish')
          .then(m => m.ZiniaInstallmentsV1FinishModule),
    },
    [PaymentMethodVariantEnum.VariantTwo]: {
      import: () =>
        import('@pe/checkout/zinia-installments/v2/finish')
          .then(m => m.ZiniaInstallmentsV2FinishModule),
    },
  },
  [PaymentMethodEnum.ZINIA_POS_INSTALLMENT_DE]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () =>
        import('@pe/checkout/zinia-installments/v1/finish')
          .then(m => m.ZiniaInstallmentsV1FinishModule),
    },
    [PaymentMethodVariantEnum.VariantTwo]: {
      import: () =>
        import('@pe/checkout/zinia-installments/v2/finish')
          .then(m => m.ZiniaInstallmentsV2FinishModule),
    },
  },
  [PaymentMethodEnum.SANTANDER_INSTANT_AT]: {
    [PaymentMethodVariantEnum.Default]: {
      import: () => import('@pe/checkout/santander-at-instant/v1/finish')
      .then(m => m.FinishModule),
    },
    [PaymentMethodVariantEnum.VariantTwo]: {
      import: () => import('@pe/checkout/santander-at-instant/v2/finish')
      .then(m => m.FinishModule),
    },
  },
};
