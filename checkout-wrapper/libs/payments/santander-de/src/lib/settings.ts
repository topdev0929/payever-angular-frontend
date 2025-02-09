import { PaymentAddressSettingsInterface, PaymentSpecificStatusEnum } from '@pe/checkout/types';


export const HAS_NODE_FORM_OPTIONS = true;

export const PAYMENT_TIMEOUT_CHECK_STATUSES: PaymentSpecificStatusEnum[] = [
  PaymentSpecificStatusEnum.STATUS_SANTANDER_IN_PROCESS,
  PaymentSpecificStatusEnum.STATUS_SANTANDER_IN_PROGRESS,
  PaymentSpecificStatusEnum.STATUS_SANTANDER_IN_DECISION,
];
export const ALLOWED_COUNTRIES_LIST: string[] = ['DE'];

export const ICON_SETS: string[] = [
  'set',
  'payment',
  'payment-methods',
  'shipping',
];

export const BILLING_ADDRESS_SETTINGS: PaymentAddressSettingsInterface = null;

export const PROCESSING_POLLING_INTERVAL = 5_000;
export const PROCESSING_POLLING_TIMEOUT = 15_000;

export const SIGNING_LINK_POLLING_INTERVAL = 3_000;
export const SIGNING_LINK_POLLING_TIMEOUT = 300_000;
