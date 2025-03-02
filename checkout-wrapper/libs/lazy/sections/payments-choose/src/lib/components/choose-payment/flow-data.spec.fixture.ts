export const allPaymentOptions: any[] = [
  {
    id: 47,
    name: 'Santander Factoring',
    slug: 'santander-factoring-de',
    fixed_fee: 0,
    variable_fee: 0,
    accept_fee: true,
    payment_method: 'santander_factoring_de',
  },
  {
    id: 45,
    name: 'Santander DE Invoice',
    slug: 'santander-invoice-de',
    fixed_fee: 0,
    variable_fee: 0,
    accept_fee: false,
    payment_method: 'santander_invoice_de',
  },
  {
    id: 28,
    name: 'Credit Card',
    slug: 'credit-card',
    fixed_fee: 0.25,
    variable_fee: 2.9,
    accept_fee: false,
    payment_method: 'stripe',
  },
  {
    id: 41,
    name: 'Santander DE Comfort card plus',
    slug: 'santander-ccp-installment',
    fixed_fee: 0,
    variable_fee: 0,
    accept_fee: false,
    payment_method: 'santander_ccp_installment',
  },
  {
    id: 29,
    name: 'Santander Installments',
    slug: 'santander-installments',
    fixed_fee: 0,
    variable_fee: 0,
    accept_fee: false,
    payment_method: 'santander_installment',
  },
  {
    id: 27,
    name: 'PayPal',
    slug: 'paypal',
    fixed_fee: 0.35,
    variable_fee: 1.9,
    accept_fee: false,
    payment_method: 'paypal',
  },
  {
    id: 17,
    name: 'Paymill Credit Card',
    slug: 'paymill',
    settings: {
      public_key: '114053625657e1f842c5fc317cc5103c',
    },
    fixed_fee: 0.15,
    variable_fee: 2.55,
    accept_fee: true,
    payment_method: 'paymill_creditcard',
  },
  {
    id: 25,
    name: 'Direct Debit',
    slug: 'direct-debit',
    settings: {
      public_key: '114053625657e1f842c5fc317cc5103c',
    },
    fixed_fee: 0.28,
    variable_fee: 0,
    accept_fee: true,
    payment_method: 'paymill_directdebit',
  },
  {
    id: 12,
    name: 'SOFORT Banking',
    slug: 'sofort',
    fixed_fee: 0.15,
    variable_fee: 0.9,
    accept_fee: true,
    payment_method: 'sofort',
  },
  {
    id: 15,
    name: 'Wire Transfer',
    slug: 'cash',
    fixed_fee: 0,
    variable_fee: 0,
    accept_fee: true,
    payment_method: 'cash',
  },
  {
    id: 42,
    name: 'PayEx Credit Card',
    slug: 'payex-creditcard',
    image_primary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/828415a9a6777b722568fab193730806.png',
    image_secondary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/e8b4f903109f9676e71e3df63347dda2.png',
    settings: null,
    min: 0,
    max: 1050750,
    fixed_fee: 0,
    variable_fee: 0,
    accept_fee: false,
    payment_method: 'payex_creditcard',
  },
  {
    id: 40,
    name: 'PayEx Invoice',
    slug: 'payex-faktura',
    image_primary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/42bfd233104249cec40799d1bfaf3ed7.png',
    image_secondary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/5862fe6e23c63acac4648cbfd789cbaf.png',
    settings: null,
    min: 0,
    max: 50000,
    fixed_fee: 14,
    variable_fee: 0,
    accept_fee: false,
    payment_method: 'payex_faktura',
  },
  {
    id: 39,
    name: 'Santander Installments Sweden',
    slug: 'santander-installment-sweden',
    image_primary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/56ab63cae3ee7fc4c2f1133bcb0d7629.png',
    image_secondary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/05c416c63bcbbc2584bf96b1293773ce.png',
    settings: null,
    min: 540,
    max: 100000,
    fixed_fee: 0,
    variable_fee: 0,
    accept_fee: false,
    payment_method: 'santander_installment_se',
  },

  {
    id: 35,
    name: 'Santander Invoice Norway',
    slug: 'santander-invoice-nordics',
    image_primary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/dfcc5ffe710133a47825060b0550ec83.png',
    image_secondary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/42c426e43257e05c319d8fee502dc7df.png',
    settings: null,
    min: 199,
    max: 20000,
    fixed_fee: 0,
    variable_fee: 0,
    accept_fee: false,
    payment_method: 'santander_invoice_no',
  },
  {
    id: 31,
    name: 'Santander Installments Norway',
    slug: 'santander-installment-norway',
    image_primary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/c9e7f915a8b14275d66cb1fc872e1a12.png',
    image_secondary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/7208b36624fc5cef28b262d768c0d05d.png',
    settings: null,
    min: 1990,
    max: 80000,
    fixed_fee: 0,
    variable_fee: 0,
    accept_fee: false,
    payment_method: 'santander_installment_no',
  },
  {
    id: 37,
    name: 'Santander Installments Denmark',
    slug: 'santander-ratenkauf-dk',
    image_primary_filename:
      'https://stage.payever.de/media/cache/payment_option.icon/4f5c56f959a3423abd6c59fec15c312f.png',
    image_secondary_filename:
      'https://stage.payever.de/media/cache/resolve/payment_option.icon/8ea99a00813543516af053c8012c5d6d.png',
    settings: null,
    min: 1500,
    max: 100000,
    fixed_fee: 0,
    variable_fee: 0,
    accept_fee: false,
    payment_method: 'santander_installment_dk',
  },
];
