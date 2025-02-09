import { PaymentMethodEnum, PaymentMethodVariantEnum } from '@pe/checkout/types';

type PaymentSteps = {
  [Key in PaymentMethodEnum]?: {
    [Variant in PaymentMethodVariantEnum]?: boolean;
  };
};

export const ONE_STEP_PAYMENTS: PaymentSteps = {
  allianz_trade_b2b_bnpl: {
    default: true,
  },
  bfs_b2b_bnpl: {
    default: true,
  },
  hsbc: {
    default: true,
  },
  apple_pay: {
    default: true,
  },
  cash: {
    default: true,
  },
  google_pay: {
    default: true,
  },
  instant_payment: {
    default: true,
  },
  ivy: {
    default: true,
    v2: true,
  },
  paypal: {
    default: true,
  },
  sofort: {
    default: true,
  },
  stripe: {
    default: true,
  },
  stripe_directdebit: {
    default: true,
  },
  swedbank_creditcard: {
    default: true,
  },
  swedbank_invoice: {
    default: true,
  },
  santander_instant_at: {
    default: true,
    v2: true,
  },
  santander_installment_at: {
    default: true,
  },
  santander_installment: {
    default: false,
  },
  santander_pos_installment: {
    default: false,
  },
  santander_pos_installment_at: {
    default: true,
  },
  santander_factoring_de: {
    default: false,
  },
  santander_pos_factoring_de: {
    default: false,
  },
  santander_invoice_de: {
    default: true,
  },
  santander_pos_invoice_de: {
    default: true,
  },
  santander_installment_dk: {
    default: false,
  },
  santander_pos_installment_dk: {
    default: false,
  },
  santander_installment_fi: {
    default: true,
  },
  santander_pos_installment_fi: {
    default: true,
  },
  santander_installment_nl: {
    default: true,
  },
  santander_installment_no: {
    default: false,
  },
  santander_pos_installment_no: {
    default: false,
  },
  santander_invoice_no: {
    default: true,
  },
  santander_pos_invoice_no: {
    default: true,
  },
  santander_installment_se: {
    default: false,
  },
  santander_pos_installment_se: {
    default: false,
  },
  santander_installment_uk: {
    default: true,
  },
  santander_pos_installment_uk: {
    default: false,
  },
  zinia_bnpl: {
    default: true,
    v2: true,
    v3: true,
    v4: true,
  },
  zinia_bnpl_de: {
    default: true,
    v2: true,
    v3: true,
    v4: true,
  },
  zinia_installment: {
    default: true,
    v2: true,
  },
  zinia_installment_de: {
    default: true,
    v2: true,
  },
  zinia_pos: {
    default: true,
    v2: true,
  },
  zinia_pos_de: {
    default: true,
    v2: true,
  },
  zinia_slice_three: {
    default: true,
    v2: true,
  },
  zinia_slice_three_de: {
    default: true,
    v2: true,
  },
  zinia_pos_slice_three: {
    default: true,
    v2: true,
  },
  zinia_pos_slice_three_de: {
    default: true,
    v2: true,
  },
  zinia_pos_installment: {
    default: true,
    v2: true,
  },
  zinia_pos_installment_de: {
    default: true,
    v2: true,
  },
  ideal: {
    default: true,
  },
  santander_installment_be: {
    default: true,
  },
  vipps: {
    default: true,
  },
  trustly: {
    default: true,
  },
  mobile_pay: {
    default: true,
  },
  swish: {
    default: true,
  },
};
